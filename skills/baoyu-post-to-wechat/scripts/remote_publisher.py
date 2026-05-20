#!/usr/bin/env python3
"""Minimal remote WeChat draft publisher.

The TypeScript caller performs all markdown rendering, image fetching,
validation, and staging. This remote script only reads staged local files,
receives WeChat credentials on stdin, calls the WeChat API from the remote
server IP, and prints a compact JSON result.
"""

from __future__ import annotations

import json
import mimetypes
import re
import sys
import urllib.parse
import urllib.request
from pathlib import Path
from uuid import uuid4

API = "https://api.weixin.qq.com"
ROOT = Path(__file__).resolve().parent
def request_json(url: str, data=None, headers=None):
    body = None
    if data is not None:
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        headers = {"Content-Type": "application/json; charset=utf-8", **(headers or {})}
    req = urllib.request.Request(url, data=body, headers=headers or {})
    with urllib.request.urlopen(req, timeout=60) as resp:
        raw = resp.read().decode("utf-8")
    obj = json.loads(raw)
    if obj.get("errcode") not in (None, 0):
        raise RuntimeError(f"WeChat API error {obj.get('errcode')}: {obj.get('errmsg')}")
    return obj


def load_asset(asset: dict):
    if "remote_url" in asset:
        raise RuntimeError("remote_url assets are forbidden; stage remote images locally before upload")

    file_path = (ROOT / "images" / asset["filename"]).resolve()
    images_root = (ROOT / "images").resolve()
    if images_root not in file_path.parents:
        raise RuntimeError("asset path escapes images directory")
    return (
        file_path.read_bytes(),
        asset["filename"],
        asset.get("content_type") or mimetypes.guess_type(file_path.name)[0] or "application/octet-stream",
    )


def multipart_upload(url: str, asset: dict):
    data, filename, content_type = load_asset(asset)
    boundary = f"----baoyu-wechat-{uuid4().hex}"
    body = b"".join([
        f"--{boundary}\r\n".encode(),
        f'Content-Disposition: form-data; name="media"; filename="{filename}"\r\n'.encode(),
        f"Content-Type: {content_type}\r\n\r\n".encode(),
        data,
        b"\r\n",
        f"--{boundary}--\r\n".encode(),
    ])
    req = urllib.request.Request(
        url,
        data=body,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
    )
    with urllib.request.urlopen(req, timeout=120) as resp:
        raw = resp.read().decode("utf-8")
    obj = json.loads(raw)
    if obj.get("errcode") not in (None, 0):
        raise RuntimeError(f"WeChat upload error {obj.get('errcode')}: {obj.get('errmsg')}")
    return obj


def get_token(appid: str, secret: str) -> str:
    query = urllib.parse.urlencode({
        "grant_type": "client_credential",
        "appid": appid,
        "secret": secret,
    })
    return request_json(f"{API}/cgi-bin/token?{query}")["access_token"]


def upload_body_image(token: str, asset: dict) -> str:
    obj = multipart_upload(
        f"{API}/cgi-bin/media/uploadimg?access_token={urllib.parse.quote(token)}",
        asset,
    )
    url = obj["url"]
    return "https://" + url[len("http://"):] if url.startswith("http://") else url


def upload_material(token: str, asset: dict) -> str:
    obj = multipart_upload(
        f"{API}/cgi-bin/material/add_material?access_token={urllib.parse.quote(token)}&type=image",
        asset,
    )
    return obj["media_id"]


def replace_placeholder(html: str, placeholder: str, replacement: str) -> str:
    """Replace a placeholder only when it is not part of a longer numbered token."""
    escaped = re.escape(placeholder)
    return re.sub(rf"{escaped}(?!\d)", replacement, html)


def publish_to_draft(token: str, payload: dict, content: str, thumb_media_id: str | None, image_media_ids: list[str]):
    article_type = payload["article_type"]
    article = {
        "article_type": article_type,
        "title": payload["title"],
        "content": content,
        "need_open_comment": payload.get("need_open_comment", 1),
        "only_fans_can_comment": payload.get("only_fans_can_comment", 0),
    }
    if payload.get("author"):
        article["author"] = payload["author"]

    if article_type == "newspic":
        article["image_info"] = {
            "image_list": [{"image_media_id": item} for item in image_media_ids],
        }
    else:
        article["thumb_media_id"] = thumb_media_id
        if payload.get("digest"):
            article["digest"] = payload["digest"]

    return request_json(
        f"{API}/cgi-bin/draft/add?access_token={urllib.parse.quote(token)}",
        {"articles": [article]},
    )


def main() -> None:
    payload = json.loads((ROOT / "payload.json").read_text(encoding="utf-8"))
    secrets = json.loads(sys.stdin.read())
    token = get_token(secrets["app_id"], secrets["app_secret"])

    html = payload["html"]
    image_media_ids: list[str] = []
    thumb_media_id = None
    body_uploads = 0

    for item in payload.get("html_images", []):
        src = item["src"]
        body_asset = item.get("body")
        if body_asset:
            image_url = upload_body_image(token, body_asset)
            html = html.replace(src, image_url)
            body_uploads += 1

        if item.get("material"):
            media_id = upload_material(token, item["material"])
            if payload["article_type"] == "newspic":
                image_media_ids.append(media_id)
            if payload.get("collect_news_cover_fallback") and not thumb_media_id:
                thumb_media_id = media_id

    for item in payload.get("placeholder_images", []):
        image_url = upload_body_image(token, item["body"])
        replacement = f'<img src="{image_url}" style="display: block; width: 100%; margin: 1.5em auto;">'
        html = replace_placeholder(html, item["placeholder"], replacement)
        body_uploads += 1

        if item.get("material"):
            media_id = upload_material(token, item["material"])
            if payload["article_type"] == "newspic":
                image_media_ids.append(media_id)
            if payload.get("collect_news_cover_fallback") and not thumb_media_id:
                thumb_media_id = media_id

    if payload.get("cover"):
        thumb_media_id = upload_material(token, payload["cover"])

    if payload["article_type"] == "news" and not thumb_media_id:
        raise RuntimeError("news article requires thumb_media_id")
    if payload["article_type"] == "newspic" and not image_media_ids:
        raise RuntimeError("newspic requires at least one image_media_id")

    result = publish_to_draft(token, payload, html, thumb_media_id, image_media_ids)
    print(json.dumps({
        "media_id": result.get("media_id"),
        "title": payload["title"],
        "body_images": body_uploads,
        "image_media_ids": len(image_media_ids),
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()

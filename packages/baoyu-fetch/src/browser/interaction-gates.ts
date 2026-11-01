import type { WaitForInteractionRequest } from "../adapters/types";
import type { BrowserSession } from "./session";

interface GateSnapshot {
  title: string;
  currentUrl: string;
  bodyText: string;
  hasCloudflareTurnstile: boolean;
  hasCloudflareChallenge: boolean;
  hasRecaptcha: boolean;
  hasRecaptchaIframe: boolean;
  hasHcaptcha: boolean;
  hasHcaptchaIframe: boolean;
}

export function detectInteractionGateFromSnapshot(snapshot: GateSnapshot): WaitForInteractionRequest | null {
  const text = snapshot.bodyText.toLowerCase();
  const title = snapshot.title.toLowerCase();
  const url = snapshot.currentUrl.toLowerCase();

  if (
    snapshot.hasCloudflareTurnstile ||
    snapshot.hasCloudflareChallenge ||
    title.includes("just a moment") ||
    text.includes("verify you are human") ||
    text.includes("checking your browser before accessing") ||
    text.includes("enable javascript and cookies to continue") ||
    url.includes("/cdn-cgi/challenge-platform/")
  ) {
    return {
      type: "wait_for_interaction",
      kind: "cloudflare",
      provider: "cloudflare",
      reason: "Cloudflare human verification detected",
      prompt: "Please complete the Cloudflare verification in the opened Chrome window. Extraction will continue automatically once the challenge disappears.",
      requiresVisibleBrowser: true,
    };
  }

  if (
    snapshot.hasRecaptcha ||
    snapshot.hasRecaptchaIframe ||
    text.includes("i'm not a robot")
  ) {
    return {
      type: "wait_for_interaction",
      kind: "recaptcha",
      provider: "google_recaptcha",
      reason: "Google reCAPTCHA detected",
      prompt: "Please complete the reCAPTCHA verification in the opened Chrome window. Extraction will continue automatically once the challenge disappears.",
      requiresVisibleBrowser: true,
    };
  }

  if (
    snapshot.hasHcaptcha ||
    snapshot.hasHcaptchaIframe ||
    text.includes("hcaptcha")
  ) {
    return {
      type: "wait_for_interaction",
      kind: "hcaptcha",
      provider: "hcaptcha",
      reason: "hCaptcha verification detected",
      prompt: "Please complete the hCaptcha verification in the opened Chrome window. Extraction will continue automatically once the challenge disappears.",
      requiresVisibleBrowser: true,
    };
  }

  return null;
}

export async function detectInteractionGate(browser: BrowserSession): Promise<WaitForInteractionRequest | null> {
  const snapshot = await browser.evaluate<GateSnapshot>(`
    (() => {
      const bodyText = (document.body?.innerText ?? "").slice(0, 4000);
      return {
        title: document.title ?? "",
        currentUrl: window.location.href,
        bodyText,
        hasCloudflareTurnstile: Boolean(
          document.querySelector(
            '.cf-turnstile, [name="cf-turnstile-response"], iframe[src*="challenges.cloudflare.com"]'
          )
        ),
        hasCloudflareChallenge: Boolean(
          document.querySelector(
            '#challenge-running, #cf-challenge-running, .challenge-platform, [data-ray], [data-translate="checking_browser"]'
          )
        ),
        hasRecaptcha: Array.from(
          document.querySelectorAll('.g-recaptcha, iframe[title*="reCAPTCHA"]')
        ).some((el) => {
          if (el.closest(".grecaptcha-badge")) return false;
          if (el.getAttribute("data-size") === "invisible") return false;
          const src = el.getAttribute("src") ?? "";
          if (src.includes("size=invisible")) return false;
          if (src.includes("/bframe")) return false;
          return true;
        }),
        hasRecaptchaIframe: Array.from(
          document.querySelectorAll('iframe[src*="recaptcha/api2/bframe"], iframe[src*="recaptcha/enterprise/bframe"]')
        ).some((el) => {
          const style = window.getComputedStyle(el);
          if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0) return false;
          const rect = el.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.right > 0;
        }),
        hasHcaptcha: Boolean(
          document.querySelector(
            '.h-captcha, textarea[name="h-captcha-response"], iframe[title*="hCaptcha"]'
          )
        ),
        hasHcaptchaIframe: Boolean(
          document.querySelector('iframe[src*="hcaptcha.com"]')
        ),
      };
    })()
  `).catch(() => ({
    title: "",
    currentUrl: "",
    bodyText: "",
    hasCloudflareTurnstile: false,
    hasCloudflareChallenge: false,
    hasRecaptcha: false,
    hasRecaptchaIframe: false,
    hasHcaptcha: false,
    hasHcaptchaIframe: false,
  }));

  return detectInteractionGateFromSnapshot(snapshot);
}

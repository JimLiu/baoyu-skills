import { describe, expect, test } from "bun:test";
import { JSDOM } from "jsdom";
import type { BrowserSession } from "../browser/session";
import { detectInteractionGate, detectInteractionGateFromSnapshot } from "../browser/interaction-gates";

function pageSession(html: string): BrowserSession {
  const dom = new JSDOM(html, { runScripts: "outside-only", url: "https://example.com/" });
  Object.defineProperty(dom.window.HTMLElement.prototype, "innerText", {
    get() {
      return this.textContent;
    },
  });
  return {
    evaluate: async (code: string) => dom.window.eval(code),
  } as unknown as BrowserSession;
}

describe("detectInteractionGateFromSnapshot", () => {
  test("detects cloudflare challenge", () => {
    const gate = detectInteractionGateFromSnapshot({
      title: "Just a moment...",
      currentUrl: "https://example.com/cdn-cgi/challenge-platform/h/b",
      bodyText: "Checking your browser before accessing example.com",
      hasCloudflareTurnstile: true,
      hasCloudflareChallenge: true,
      hasRecaptcha: false,
      hasRecaptchaIframe: false,
      hasHcaptcha: false,
      hasHcaptchaIframe: false,
    });

    expect(gate?.kind).toBe("cloudflare");
    expect(gate?.provider).toBe("cloudflare");
  });

  test("detects google recaptcha", () => {
    const gate = detectInteractionGateFromSnapshot({
      title: "Protected page",
      currentUrl: "https://example.com/form",
      bodyText: "Please verify that you're not a robot via reCAPTCHA",
      hasCloudflareTurnstile: false,
      hasCloudflareChallenge: false,
      hasRecaptcha: true,
      hasRecaptchaIframe: true,
      hasHcaptcha: false,
      hasHcaptchaIframe: false,
    });

    expect(gate?.kind).toBe("recaptcha");
    expect(gate?.provider).toBe("google_recaptcha");
  });

  test("returns null when no challenge is present", () => {
    const gate = detectInteractionGateFromSnapshot({
      title: "Example",
      currentUrl: "https://example.com/article",
      bodyText: "Normal article body",
      hasCloudflareTurnstile: false,
      hasCloudflareChallenge: false,
      hasRecaptcha: false,
      hasRecaptchaIframe: false,
      hasHcaptcha: false,
      hasHcaptchaIframe: false,
    });

    expect(gate).toBeNull();
  });

  test("ignores passive recaptcha badge text without a challenge", () => {
    const gate = detectInteractionGateFromSnapshot({
      title: "Contact us",
      currentUrl: "https://example.com/contact",
      bodyText: "This site is protected by reCAPTCHA and the Google Privacy Policy and Terms of Service apply.",
      hasCloudflareTurnstile: false,
      hasCloudflareChallenge: false,
      hasRecaptcha: false,
      hasRecaptchaIframe: false,
      hasHcaptcha: false,
      hasHcaptchaIframe: false,
    });

    expect(gate).toBeNull();
  });

  test("ignores the reCAPTCHA v3 badge in a live page", async () => {
    const gate = await detectInteractionGate(pageSession(`<body>
      <p>Article body. This site is protected by reCAPTCHA.</p>
      <div class="grecaptcha-badge">
        <iframe title="reCAPTCHA" src="https://www.google.com/recaptcha/api2/anchor?k=x&size=invisible"></iframe>
        <textarea name="g-recaptcha-response"></textarea>
      </div>
    </body>`));

    expect(gate).toBeNull();
  });

  test("ignores invisible reCAPTCHA v2 and a hidden challenge frame", async () => {
    const gate = await detectInteractionGate(pageSession(`<body>
      <div class="g-recaptcha" data-size="invisible" data-sitekey="x"></div>
      <div style="visibility: hidden"><iframe title="recaptcha challenge" src="https://www.google.com/recaptcha/api2/bframe?k=x"></iframe></div>
    </body>`));

    expect(gate).toBeNull();
  });

  test("still gates the reCAPTCHA v2 checkbox in a live page", async () => {
    const gate = await detectInteractionGate(pageSession(`<body>
      <div class="g-recaptcha" data-sitekey="x">
        <iframe title="reCAPTCHA" src="https://www.google.com/recaptcha/api2/anchor?k=x&size=normal"></iframe>
      </div>
    </body>`));

    expect(gate?.kind).toBe("recaptcha");
  });
});

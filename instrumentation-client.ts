// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const isProduction = process.env.NODE_ENV === "production";
const shouldEnableSentry = Boolean(SENTRY_DSN && isProduction);

type CaptureRouterTransitionStart = typeof import("@sentry/nextjs")["captureRouterTransitionStart"];

let captureRouterTransitionStart: CaptureRouterTransitionStart | undefined;

if (shouldEnableSentry) {
  void import("@sentry/nextjs").then((Sentry) => {
    Sentry.init({
      dsn: SENTRY_DSN,
      tracesSampleRate: 1,
      enableLogs: false,
      debug: false,
    });

    captureRouterTransitionStart = Sentry.captureRouterTransitionStart;
  });
}

export const onRouterTransitionStart: CaptureRouterTransitionStart = (...args) => {
  if (captureRouterTransitionStart) {
    return captureRouterTransitionStart(...args);
  }
  return undefined;
};

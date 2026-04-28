type RuntimeAppConfig = {
  orderServiceUrl?: string;
  paymentServiceUrl?: string;
  deliveryServiceUrl?: string;
};

declare global {
  interface Window {
    __APP_CONFIG__?: RuntimeAppConfig;
  }
}

function getBrowserLocation() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.location;
}

function buildBrowserServiceUrl(port: number) {
  const location = getBrowserLocation();

  if (!location) {
    return `http://127.0.0.1:${port}`;
  }

  return `${location.protocol}//${location.hostname}:${port}`;
}

function normalizeUrl(value: string) {
  return value.trim().replace(/\/$/, "");
}

function resolveServiceUrl(rawUrl: string | undefined, port: number) {
  const runtimeUrl = rawUrl?.trim();

  if (runtimeUrl) {
    return normalizeUrl(runtimeUrl);
  }

  return buildBrowserServiceUrl(port);
}

const runtimeConfig = typeof window === "undefined" ? undefined : window.__APP_CONFIG__;

export const appConfig = {
  orderServiceUrl: resolveServiceUrl(runtimeConfig?.orderServiceUrl, 8081),
  paymentServiceUrl: resolveServiceUrl(runtimeConfig?.paymentServiceUrl, 8082),
  deliveryServiceUrl: resolveServiceUrl(runtimeConfig?.deliveryServiceUrl, 8083),
} as const;

import { createHash } from "crypto";
import { NextResponse } from "next/server";

/** Upstream OpenPanel IIFE bundle (proxied under a neutral local filename). */
const UPSTREAM_SCRIPT_URL = "https://openpanel.dev/op1.js";

export const OPENPANEL_PROXY_SCRIPT_SUFFIX = "client.js" as const;

const buildProxyHeaders = (request: Request): Headers => {
  const headers = new Headers();
  const clientIp =
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0] ??
    request.headers.get("x-vercel-forwarded-for");

  headers.set("Content-Type", "application/json");
  headers.set("openpanel-client-id", request.headers.get("openpanel-client-id") ?? "");

  const origin =
    request.headers.get("origin") ??
    (() => {
      const url = new URL(request.url);
      return `${url.protocol}//${url.host}`;
    })();

  headers.set("origin", origin);
  headers.set("User-Agent", request.headers.get("user-agent") ?? "");

  if (clientIp) {
    headers.set("openpanel-client-ip", clientIp);
  }

  return headers;
};

const proxyApiRequest = async (
  request: Request,
  apiUrl: string,
  upstreamPath: string,
): Promise<NextResponse> => {
  const headers = buildProxyHeaders(request);

  try {
    const upstream = await fetch(`${apiUrl}${upstreamPath}`, {
      method: request.method,
      headers,
      body:
        request.method === "POST"
          ? JSON.stringify(await request.json())
          : undefined,
    });

    if (upstream.headers.get("content-type")?.includes("application/json")) {
      return NextResponse.json(await upstream.json(), { status: upstream.status });
    }

    return NextResponse.json(await upstream.text(), { status: upstream.status });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to proxy request",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
};

const proxyScript = async (request: Request): Promise<NextResponse> => {
  let upstreamUrl = UPSTREAM_SCRIPT_URL;
  const url = new URL(request.url);

  if (url.searchParams.size > 0) {
    upstreamUrl += `?${url.searchParams.toString()}`;
  }

  try {
    const upstream = await fetch(upstreamUrl, { next: { revalidate: 86400 } });
    const body = await upstream.text();
    const etag = `"${createHash("md5").update(upstreamUrl + body).digest("hex")}"`;

    return new NextResponse(body, {
      headers: {
        "Content-Type": "text/javascript",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=86400",
        ETag: etag,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch script",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
};

type OpenpanelProxyHandlerOptions = {
  apiUrl?: string;
  scriptSuffix?: string;
};

/** First-party proxy with neutral paths to reduce adblock false positives. */
export const createOpenpanelProxyHandler = (
  options: OpenpanelProxyHandlerOptions = {},
) => {
  const apiUrl = options.apiUrl ?? "";
  const scriptSuffix = options.scriptSuffix ?? OPENPANEL_PROXY_SCRIPT_SUFFIX;

  const handler = async (request: Request): Promise<NextResponse> => {
    const pathname = new URL(request.url).pathname;

    if (request.method === "GET" && pathname.endsWith(`/${scriptSuffix}`)) {
      return proxyScript(request);
    }

    const trackIndex = pathname.indexOf("/track");
    if (trackIndex === -1) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const upstreamPath = pathname.substring(trackIndex);
    return proxyApiRequest(request, apiUrl, upstreamPath);
  };

  return { GET: handler, POST: handler };
};

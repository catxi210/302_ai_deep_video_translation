import { createScopedLogger } from "@/utils";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "edge";

const logger = createScopedLogger("VideoProxy");

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get("url");
    if (!url) {
      return NextResponse.json(
        { error: { message: "URL is required" } },
        { status: 400 }
      );
    }

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept: "*/*",
        "Accept-Language": "en-US,en;q=0.9",
        Range: request.headers.get("range") || "bytes=0-",
        Referer: new URL(url).origin,
      },
    });

    if (!response.ok && response.status !== 206) {
      logger.error(
        "Proxy error: Bad response",
        response.status,
        response.statusText
      );
      return NextResponse.json(
        { error: { message: "Failed to fetch video" } },
        { status: response.status }
      );
    }

    const headers = new Headers();
    headers.set("Accept-Ranges", "bytes");
    headers.set(
      "Content-Type",
      response.headers.get("Content-Type") || "video/mp4"
    );
    headers.set("Content-Length", response.headers.get("Content-Length") || "");
    headers.set("Content-Range", response.headers.get("Content-Range") || "");
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Range");

    if (response.status === 206) {
      headers.set("Accept-Ranges", "bytes");
      headers.set("Content-Range", response.headers.get("Content-Range") || "");
    }

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  } catch (error) {
    logger.error("Proxy error:", error);
    return NextResponse.json(
      { error: { message: "Failed to proxy video" } },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "Range",
      "Access-Control-Max-Age": "86400",
    },
  });
}

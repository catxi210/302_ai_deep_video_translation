import { createScopedLogger } from "@/utils";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const logger = createScopedLogger("vt-image-proxy");

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  try {
    const response = await fetch(url);
    const blob = await response.blob();

    return new NextResponse(blob, {
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "image/jpeg",
        "Cache-Control": "public, max-age=31536000",
      },
    });
  } catch (error) {
    logger.error("Error proxying image:", error);
    return new NextResponse("Error proxying image", { status: 500 });
  }
}

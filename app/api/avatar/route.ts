import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const imageUrl = request.nextUrl.searchParams.get("url");

  if (!imageUrl) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(imageUrl);
  } catch {
    return new NextResponse("Invalid url parameter", { status: 400 });
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    return new NextResponse("Unsupported url protocol", { status: 400 });
  }

  try {
    const upstreamResponse = await fetch(parsedUrl.toString(), {
      cache: "force-cache",
      headers: {
        Accept: "image/*",
      },
    });

    if (!upstreamResponse.ok) {
      return new NextResponse("Avatar fetch failed", { status: upstreamResponse.status });
    }

    const contentType = upstreamResponse.headers.get("content-type") ?? "image/jpeg";
    const arrayBuffer = await upstreamResponse.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    });
  } catch {
    return new NextResponse("Avatar proxy error", { status: 502 });
  }
}

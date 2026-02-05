import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  // AI SDK usually appends /chat/completions or whatever. 
  // If we set OLLAMA_BASE_URL to .../api/ollama, the SDK might append /chat/completions (v1/chat/completions?).
  // Usually OpenAI SDK expects base URL to be `/v1` compliant.
  // If we proxy to `http://localhost:11434/v1`, we should match.
  
  const pathStr = path.join("/");
  const targetUrl = `http://localhost:11434/v1/${pathStr}`;

  console.log(`[Ollama Proxy] POST request to ${targetUrl}`);

  try {
    const body = await req.json();

    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
        const text = await response.text();
        console.error(`[Ollama Proxy] Upstream Error ${response.status}: ${text}`);
        return new NextResponse(text, { status: response.status });
    }

    // Handle streaming vs json
    const contentType = response.headers.get("content-type");
    if (contentType?.includes("text/event-stream")) {
        // Simple stream passthrough
        return new NextResponse(response.body, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            }
        });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error("[Ollama Proxy] Internal Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pathStr = path.join("/");
  const targetUrl = `http://localhost:11434/v1/${pathStr}`;

  console.log(`[Ollama Proxy] GET request to ${targetUrl}`);

  try {
    const response = await fetch(targetUrl);
    
    if (!response.ok) {
        return new NextResponse(await response.text(), { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
     return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

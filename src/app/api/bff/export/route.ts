import { NextRequest, NextResponse } from "next/server";

/**
 * BFF: Data Export Engine
 * Handles heavy transformations and file generation server-side.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "csv";

  // Mocking data retrieval from Convex/CMS
  const leads = [
    { id: "1", name: "Alice", status: "qualified", source: "linkedin" },
    { id: "2", name: "Bob", status: "new", source: "telegram" },
  ];

  if (type === "csv") {
    const csvContent = [
        "id,name,status,source",
        ...leads.map(l => `${l.id},${l.name},${l.status},${l.source}`)
    ].join("\n");

    return new Response(csvContent, {
        headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": "attachment; filename=leads_export.csv",
        },
    });
  }

  return NextResponse.json({ error: "Unsupported format" }, { status: 400 });
}

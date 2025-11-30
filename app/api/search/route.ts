import { NextRequest, NextResponse } from "next/server";
import { searchThreads } from "@/lib/actions";

export const runtime = "edge";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");

    if (!q) {
        return NextResponse.json({ results: [] });
    }

    const results = await searchThreads(q);
    return NextResponse.json({ results });
}

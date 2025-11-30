import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getSessionUser } from "@/lib/auth";

export const runtime = "edge";

export async function POST(req: NextRequest) {
    const user = await getSessionUser();
    if (!user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
        return new NextResponse("No file provided", { status: 400 });
    }

    const { env } = getCloudflareContext();
    const key = `uploads/${user.id}/${crypto.randomUUID()}-${file.name}`;

    await env.STORAGE.put(key, file.stream(), {
        httpMetadata: { contentType: file.type }
    });

    // In a real app, you might return a presigned URL or a public URL if R2 is public
    // Here we return a local API route that proxies to R2
    return NextResponse.json({ url: `/api/file/${key}` });
}

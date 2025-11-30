import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export const runtime = "edge";

export async function GET(req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
    // Note: The params passed to a catch-all route like [...key] are arrays.
    // However, here we are matching specific route structure or query.
    // Let's assume the usage is /api/file/path/to/obj

    // Actually, handling slashes in params is tricky in Next.js without [...slug]
    // Let's parse the URL manually to get the key from the path after /api/file/
    const url = new URL(req.url);
    const key = url.pathname.replace('/api/file/', '');

    const { env } = getCloudflareContext();
    const object = await env.STORAGE.get(key);

    if (!object) {
        return new NextResponse("Not Found", { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);

    return new NextResponse(object.body, {
        headers,
    });
}

import { DurableObject } from "cloudflare:workers";

export class SessionManager extends DurableObject {
    async fetch(request: Request) {
        const url = new URL(request.url);
        const path = url.pathname;

        if (path === "/create") {
            const body = await request.json() as { userId: string, userData: any };
            const sessionId = crypto.randomUUID();
            await this.ctx.storage.put(sessionId, {
                userId: body.userId,
                userData: body.userData,
                createdAt: Date.now(),
                expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7 // 7 days
            });
            return new Response(JSON.stringify({ sessionId }), { status: 200 });
        }

        if (path === "/validate") {
            const body = await request.json() as { sessionId: string };
            const session = await this.ctx.storage.get(body.sessionId) as any;

            if (!session) {
                return new Response(JSON.stringify({ valid: false }), { status: 200 });
            }

            if (Date.now() > session.expiresAt) {
                 await this.ctx.storage.delete(body.sessionId);
                 return new Response(JSON.stringify({ valid: false }), { status: 200 });
            }

            return new Response(JSON.stringify({ valid: true, session }), { status: 200 });
        }

        if (path === "/destroy") {
             const body = await request.json() as { sessionId: string };
             await this.ctx.storage.delete(body.sessionId);
             return new Response(JSON.stringify({ success: true }), { status: 200 });
        }

        return new Response("Not found", { status: 404 });
    }
}

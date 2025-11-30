import { getCloudflareContext } from "@opennextjs/cloudflare";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function createSession(userId: string, userData: any) {
    const { env } = getCloudflareContext();
    const id = env.SESSIONS.idFromName("global_session_manager");
    const stub = env.SESSIONS.get(id);

    const res = await stub.fetch("http://do/create", {
        method: "POST",
        body: JSON.stringify({ userId, userData }),
        headers: { "Content-Type": "application/json" }
    });

    if (res.ok) {
        const { sessionId } = await res.json() as { sessionId: string };
        const cookieStore = await cookies();
        cookieStore.set("session_id", sessionId, { httpOnly: true, secure: true, path: "/" });
        return sessionId;
    }
    return null;
}

export async function validateSession() {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session_id")?.value;

    if (!sessionId) return null;

    const { env } = getCloudflareContext();
    const id = env.SESSIONS.idFromName("global_session_manager");
    const stub = env.SESSIONS.get(id);

    const res = await stub.fetch("http://do/validate", {
        method: "POST",
        body: JSON.stringify({ sessionId }),
        headers: { "Content-Type": "application/json" }
    });

    if (res.ok) {
        const data = await res.json() as { valid: boolean, session?: any };
        if (data.valid) {
            return data.session;
        }
    }
    return null;
}

export async function destroySession() {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session_id")?.value;

    if (sessionId) {
        const { env } = getCloudflareContext();
        const id = env.SESSIONS.idFromName("global_session_manager");
        const stub = env.SESSIONS.get(id);

        await stub.fetch("http://do/destroy", {
            method: "POST",
            body: JSON.stringify({ sessionId }),
            headers: { "Content-Type": "application/json" }
        });

        cookieStore.delete("session_id");
    }
}

export async function getSessionUser() {
    const session = await validateSession();
    if (!session) return null;
    return session.userData; // Assuming userData contains { id, username, role, ... }
}

export async function requireAuth() {
    const user = await getSessionUser();
    if (!user) {
        redirect("/api/auth/signin");
    }
    return user;
}

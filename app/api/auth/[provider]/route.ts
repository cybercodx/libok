import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";

export const runtime = "edge";

// Mock OAuth Flow for Demonstration as I don't have real OAuth credentials
// In production, use `workers-oauth-provider` or standard OAuth 2.0 flows with client id/secret stored in env
export async function GET(req: NextRequest, { params }: { params: Promise<{ provider: string }> }) {
    const { provider } = await params;
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    // Redirect to provider login (Mock)
    if (!code) {
        // Here you would redirect to GitHub/Google OAuth URL
        // For this demo, we simulate a callback immediately with a mock code
        const callbackUrl = new URL(req.url);
        callbackUrl.searchParams.set("code", "mock_auth_code_" + provider);
        return NextResponse.redirect(callbackUrl);
    }

    // Handle Callback (Mock)
    // 1. Exchange code for access token (Mock)
    // 2. Fetch user profile (Mock)

    const mockUser = {
        id: `mock_${provider}_user`,
        username: `HackUser_${Math.floor(Math.random() * 1000)}`,
        email: `user@example.com`,
        avatarUrl: `https://avatars.githubusercontent.com/u/${Math.floor(Math.random() * 1000)}?v=4`,
        role: "user"
    };

    const db = getDb();

    // Check if user exists, if not create
    let user = await db.query.users.findFirst({
        where: eq(users.id, mockUser.id)
    });

    if (!user) {
        await db.insert(users).values({
            id: mockUser.id,
            username: mockUser.username,
            email: mockUser.email,
            avatarUrl: mockUser.avatarUrl,
            role: "user"
        });
        user = mockUser as any;
    }

    if (!user) throw new Error("Failed to create or retrieve user");

    // Create Session
    await createSession(user.id, user);

    return NextResponse.redirect(new URL("/", req.url));
}

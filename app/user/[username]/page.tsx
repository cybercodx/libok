import { getDb } from "@/lib/db";
import { users, threads } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export const runtime = "edge";

export default async function UserProfile({ params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;
    const db = getDb();

    // Fetch user
    const user = await db.query.users.findFirst({
        where: eq(users.username, username)
    });

    if (!user) notFound();

    // Fetch recent threads
    const recentThreads = await db.query.threads.findMany({
        where: eq(threads.userId, user.id),
        orderBy: [desc(threads.createdAt)],
        limit: 5
    });

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="border border-green-900 bg-black p-6 flex items-start space-x-6">
                <div className="relative w-24 h-24 border border-green-800 bg-green-900/20">
                    {user.avatarUrl ? (
                        <Image
                            src={user.avatarUrl}
                            alt={user.username}
                            fill
                            className="object-cover"
                            unoptimized
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-green-700 font-mono text-4xl">?</div>
                    )}
                </div>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-green-500">{user.username}</h1>
                    <div className="mt-2 text-sm text-green-700 space-y-1">
                        <p>ID: {user.id}</p>
                        <p>ROLE: {user.role?.toUpperCase()}</p>
                        <p>REPUTATION: {user.reputation}</p>
                        <p>JOINED: {user.createdAt?.toLocaleDateString()}</p>
                    </div>
                </div>
            </div>

            <div className="border border-green-900 bg-black">
                <h3 className="text-lg font-bold text-green-500 p-4 border-b border-green-900">RECENT_ACTIVITY</h3>
                {recentThreads.length > 0 ? (
                    <div>
                        {recentThreads.map(thread => (
                            <div key={thread.id} className="p-4 border-b border-green-900 hover:bg-green-900/10">
                                <Link href={`/thread/${thread.slug}`} className="text-green-400 hover:underline font-bold">
                                    {thread.title}
                                </Link>
                                <div className="text-xs text-green-700 mt-1">
                                    {thread.createdAt?.toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-4 text-green-800 text-center">No recent activity detected.</div>
                )}
            </div>
        </div>
    );
}

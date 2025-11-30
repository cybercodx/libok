'use server';

import { getDb } from './db';
import { threads, posts, categories, users, attachments } from './schema';
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { revalidatePath } from 'next/cache';
import { eq, desc, and, like, sql } from 'drizzle-orm';
import { getSessionUser } from './auth';

function logAnalytics(event: string, data?: any) {
    try {
        const { env } = getCloudflareContext();
        env.ANALYTICS.writeDataPoint({
            blobs: [event, JSON.stringify(data)],
            indexes: [event]
        });
    } catch (e) {
        console.error("Analytics error", e);
    }
}

export async function createThread(formData: FormData) {
    const user = await getSessionUser();
    if (!user) return { error: "Unauthorized" };

    const db = getDb();
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const categoryId = formData.get('categoryId') as string;

    // Simple slug generation
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + crypto.randomUUID().slice(0, 6);
    const id = crypto.randomUUID();

    await db.insert(threads).values({
        id,
        title,
        slug,
        categoryId,
        userId: user.id,
    });

    // Create the first post
    await db.insert(posts).values({
        id: crypto.randomUUID(),
        threadId: id,
        userId: user.id,
        content: content
    });

    // Update reply count? Initial post usually counts as 0 replies or 1? Let's say 0 replies (comments).

    logAnalytics('create_thread', { id, categoryId, userId: user.id });
    revalidatePath('/');
    return { success: true, slug };
}

export async function createPost(formData: FormData) {
    const user = await getSessionUser();
    if (!user) return { error: "Unauthorized" };

    const db = getDb();
    const content = formData.get('content') as string;
    const threadId = formData.get('threadId') as string;
    const image = formData.get('image') as File;

    const postId = crypto.randomUUID();

    await db.insert(posts).values({
        id: postId,
        content,
        threadId,
        userId: user.id,
    });

    // Handle Attachment
    if (image && image.size > 0) {
        const { env } = getCloudflareContext();
        const key = `attachments/${threadId}/${postId}/${image.name}`;

        await env.STORAGE.put(key, image.stream(), {
            httpMetadata: { contentType: image.type }
        });

        await db.insert(attachments).values({
            id: crypto.randomUUID(),
            postId: postId,
            filename: image.name,
            r2Key: key,
            size: image.size,
            mimeType: image.type
        });
    }

    // Update thread reply count
    await db.update(threads)
        .set({ replies: sql`${threads.replies} + 1` })
        .where(eq(threads.id, threadId));

    logAnalytics('create_post', { threadId, userId: user.id });
    revalidatePath(`/thread/${threadId}`); // Note: path might need slug, will handle in controller
    return { success: true };
}

export async function getThreads(categoryId?: string) {
    const db = getDb();

    let whereClause = undefined;
    if (categoryId) {
        whereClause = eq(threads.categoryId, categoryId);
    }

    const result = await db.select({
        thread: threads,
        author: users.username,
        category: categories.name,
        categorySlug: categories.slug
    })
    .from(threads)
    .leftJoin(users, eq(threads.userId, users.id))
    .leftJoin(categories, eq(threads.categoryId, categories.id))
    .where(whereClause)
    .orderBy(desc(threads.createdAt));

    return result;
}

export async function getThread(slug: string) {
    const db = getDb();

    // Fetch Thread
    const threadResult = await db.select({
        thread: threads,
        author: users,
        category: categories
    })
    .from(threads)
    .leftJoin(users, eq(threads.userId, users.id))
    .leftJoin(categories, eq(threads.categoryId, categories.id))
    .where(eq(threads.slug, slug))
    .get();

    if (!threadResult) return null;

    // Increment Views (Optimistic, maybe should use DO or simple update)
    // await db.update(threads).set({ views: sql`${threads.views} + 1` }).where(eq(threads.id, threadResult.thread.id));
    // D1 write might be slow for every view, but okay for this scale.

    const threadPosts = await db.select({
        post: posts,
        author: users,
        attachment: attachments
    })
    .from(posts)
    .leftJoin(users, eq(posts.userId, users.id))
    .leftJoin(attachments, eq(attachments.postId, posts.id))
    .where(eq(posts.threadId, threadResult.thread.id))
    .orderBy(sql`${posts.createdAt} ASC`);

    logAnalytics('view_thread', { id: threadResult.thread.id, slug });

    return { ...threadResult, posts: threadPosts };
}

export async function getCategories() {
    const db = getDb();
    return await db.select().from(categories);
}

export async function getCategory(slug: string) {
    const db = getDb();
    return await db.select().from(categories).where(eq(categories.slug, slug)).get();
}

export async function searchThreads(query: string) {
    const db = getDb();
    // Basic search using LIKE
    return await db.select({
        thread: threads,
        author: users.username,
        category: categories.name
    })
    .from(threads)
    .leftJoin(users, eq(threads.userId, users.id))
    .leftJoin(categories, eq(threads.categoryId, categories.id))
    .where(like(threads.title, `%${query}%`))
    .limit(20);
}

import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email').unique(),
  avatarUrl: text('avatar_url'),
  reputation: integer('reputation').default(0),
  role: text('role', { enum: ['admin', 'moderator', 'verified', 'user'] }).default('user'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

export const categories = sqliteTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  parentId: text('parent_id'), // For subcategories
});

export const threads = sqliteTable('threads', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  categoryId: text('category_id').references(() => categories.id).notNull(),
  userId: text('user_id').references(() => users.id).notNull(),
  views: integer('views').default(0),
  replies: integer('replies').default(0),
  status: text('status', { enum: ['open', 'solved', 'closed'] }).default('open'),
  pinned: integer('pinned', { mode: 'boolean' }).default(false),
  locked: integer('locked', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

export const posts = sqliteTable('posts', {
  id: text('id').primaryKey(),
  threadId: text('thread_id').references(() => threads.id).notNull(),
  userId: text('user_id').references(() => users.id).notNull(),
  content: text('content').notNull(),
  editedAt: integer('edited_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
});

export const tags = sqliteTable('tags', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
});

export const threadTags = sqliteTable('thread_tags', {
  threadId: text('thread_id').references(() => threads.id).notNull(),
  tagId: text('tag_id').references(() => tags.id).notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.threadId, t.tagId] }),
}));

export const attachments = sqliteTable('attachments', {
  id: text('id').primaryKey(),
  postId: text('post_id').references(() => posts.id).notNull(),
  filename: text('filename').notNull(),
  r2Key: text('r2_key').notNull(),
  size: integer('size').notNull(),
  mimeType: text('mime_type').notNull(),
});

export const votes = sqliteTable('votes', {
  id: text('id').primaryKey(),
  postId: text('post_id').references(() => posts.id).notNull(),
  userId: text('user_id').references(() => users.id).notNull(),
  value: integer('value').notNull(), // 1 for upvote, -1 for downvote
});

export const bookmarks = sqliteTable('bookmarks', {
  id: text('id').primaryKey(),
  threadId: text('thread_id').references(() => threads.id).notNull(),
  userId: text('user_id').references(() => users.id).notNull(),
});

export const reports = sqliteTable('reports', {
  id: text('id').primaryKey(),
  postId: text('post_id').references(() => posts.id).notNull(),
  reporterId: text('reporter_id').references(() => users.id).notNull(),
  reason: text('reason').notNull(),
  status: text('status', { enum: ['pending', 'resolved', 'dismissed'] }).default('pending'),
});

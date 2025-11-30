import { getThread, createPost } from '@/lib/actions';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getSessionUser } from '@/lib/auth';

export const runtime = 'edge';

export default async function ThreadPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getThread(slug);
  const user = await getSessionUser();

  if (!data) {
    notFound();
  }

  const { thread, posts, author, category } = data;

  return (
    <div className="space-y-6">
      <div className="border border-green-900 bg-black">
        <div className="p-4 border-b border-green-900 bg-green-900/10 flex justify-between items-center">
            <h1 className="text-xl font-bold text-green-400">./{thread.title}</h1>
            <div className="text-xs text-green-600">
                {thread.locked ? <span className="text-red-500 mr-2">[LOCKED]</span> : null}
                {thread.pinned ? <span className="text-yellow-500 mr-2">[PINNED]</span> : null}
                <span className={`px-2 py-0.5 rounded border border-green-800 text-xs`}>
                    {thread.status?.toUpperCase() || 'OPEN'}
                </span>
            </div>
        </div>
        <div className="p-4 text-xs text-green-700 flex space-x-4 border-b border-green-900">
             <span>AUTHOR: {author?.username || 'Unknown'}</span>
             <span>CATEGORY: {category?.name || 'Uncategorized'}</span>
             <span>ID: {thread.id.substring(0, 8)}</span>
             <span>VIEWS: {thread.views}</span>
        </div>
      </div>

      <div className="space-y-4">
        {posts.map((post, index) => (
            <div key={post.post.id} className="border border-green-900 bg-black">
                <div className="bg-green-900/5 p-2 border-b border-green-900 flex justify-between items-center">
                     <div className="text-xs text-green-500 font-bold">
                        {post.author?.username || 'Unknown'} <span className="text-green-800 font-normal">@{post.post.createdAt?.toLocaleString()}</span>
                     </div>
                     <div className="text-xs text-green-800">#{index}</div>
                </div>
                <div className="p-4">
                    <div className="whitespace-pre-wrap font-mono text-sm text-green-300">{post.post.content}</div>
                    {post.attachment && (
                        <div className="mt-4 border-t border-green-900 pt-2">
                             <p className="text-xs text-green-700 mb-1">ATTACHMENT: {post.attachment.filename}</p>
                             {post.attachment.mimeType.startsWith('image/') ? (
                                <div className="relative h-64 w-full max-w-md">
                                    <Image
                                    src={`/api/file/${post.attachment.r2Key}`}
                                    alt="Attached evidence"
                                    fill
                                    className="object-contain object-left"
                                    unoptimized
                                    />
                                </div>
                             ) : (
                                 <a href={`/api/file/${post.attachment.r2Key}`} className="text-green-500 hover:underline text-xs" download>
                                     [DOWNLOAD_FILE] ({Math.round(post.attachment.size / 1024)}KB)
                                 </a>
                             )}
                        </div>
                    )}
                </div>
            </div>
        ))}
      </div>

      {!thread.locked && user ? (
        <div className="border border-green-900 bg-black p-4 mt-8">
            <h3 className="text-lg font-bold mb-4 text-green-500 border-b border-green-900 pb-2">APPEND_TO_LOG:</h3>
            <form action={async (formData) => {
              'use server';
              await createPost(formData);
            }} className="space-y-4">
                <input type="hidden" name="threadId" value={thread.id} />
                <div>
                    <textarea
                        name="content"
                        rows={6}
                        className="w-full bg-black border border-green-700 p-2 text-green-500 focus:outline-none focus:border-green-400 font-mono text-sm"
                        placeholder="Enter your response..."
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm mb-1 text-green-700">ATTACH_EVIDENCE (Optional):</label>
                    <input type="file" name="image" className="block w-full text-sm text-green-500 file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-green-900 file:text-green-100 hover:file:bg-green-700"/>
                </div>
                <button type="submit" className="bg-green-800 text-black px-4 py-2 font-bold hover:bg-green-600 text-sm">
                    [SUBMIT_POST]
                </button>
            </form>
        </div>
      ) : (
          !user ? (
            <div className="text-center p-4 border border-green-900 text-green-600">
                <Link href="/api/auth/github" className="underline hover:text-green-400">LOGIN</Link> TO REPLY
            </div>
          ) : (
            <div className="text-center p-4 border border-green-900 text-red-500">
                THREAD_LOCKED
            </div>
          )
      )}
    </div>
  );
}

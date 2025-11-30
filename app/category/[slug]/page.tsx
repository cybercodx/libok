import Link from 'next/link';
import { getThreads, getCategory, getCategories } from '@/lib/actions';
import { notFound } from 'next/navigation';

export const runtime = 'edge';

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) notFound();

  const threads = await getThreads(category.id);
  const categoriesList = await getCategories();

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="md:col-span-1 space-y-6">
         <div className="border border-green-900 bg-black p-4">
            <h3 className="text-lg font-bold text-green-500 mb-4 border-b border-green-900 pb-2">/ETC/CATEGORIES</h3>
            <div className="space-y-2">
                <Link href="/" className="block text-green-400 hover:text-green-300 hover:bg-green-900/20 p-1">
                   [ALL_THREADS]
                </Link>
                {categoriesList.map(cat => (
                    <Link key={cat.id} href={`/category/${cat.slug}`} className={`block text-green-400 hover:text-green-300 hover:bg-green-900/20 p-1 ${cat.slug === slug ? 'bg-green-900/30' : ''}`}>
                        [{cat.name.toUpperCase()}]
                    </Link>
                ))}
            </div>
         </div>
      </div>

      <div className="md:col-span-3 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight text-green-500">
            root@forum:~# ls -la /category/{slug}
          </h1>
        </div>

        <div className="border border-green-900 rounded-none bg-black">
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-green-900 font-bold text-green-700 text-xs md:text-sm">
            <div className="col-span-8 md:col-span-7">TITLE</div>
            <div className="col-span-2 md:col-span-2 text-center">STATS</div>
            <div className="col-span-2 md:col-span-3 text-right">LAST_ACT</div>
          </div>
          {threads.map((item) => (
            <div key={item.thread.id} className="grid grid-cols-12 gap-4 p-4 border-b border-green-900 hover:bg-green-900/10 text-sm">
              <div className="col-span-8 md:col-span-7">
                <div className="flex items-center gap-2">
                    {item.thread.pinned && <span className="text-yellow-500 text-xs">[PIN]</span>}
                    {item.thread.locked && <span className="text-red-500 text-xs">[LOCK]</span>}
                    <Link href={`/thread/${item.thread.slug}`} className="hover:underline font-bold text-green-400">
                        {item.thread.title}
                    </Link>
                </div>
                <div className="text-xs text-green-700 mt-1">
                    by {item.author}
                </div>
              </div>
              <div className="col-span-2 md:col-span-2 text-center text-xs text-green-600 flex flex-col justify-center">
                  <span>{item.thread.replies} reps</span>
                  <span>{item.thread.views} views</span>
              </div>
              <div className="col-span-2 md:col-span-3 text-right text-xs text-green-700 flex items-center justify-end">
                  {item.thread.createdAt?.toLocaleDateString()}
              </div>
            </div>
          ))}
          {threads.length === 0 && (
              <div className="p-8 text-center text-green-800">No threads in this category.</div>
          )}
        </div>
      </div>
    </div>
  );
}

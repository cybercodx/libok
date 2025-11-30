import { createThread, getCategories } from '@/lib/actions';
import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const runtime = 'edge';

export default async function NewThreadPage() {
  const user = await getSessionUser();
  if (!user) {
      redirect('/api/auth/github'); // Or signin page
  }

  const categories = await getCategories();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-green-500">INITIATE_NEW_THREAD</h1>

      <form action={async (formData) => {
        'use server';
        await createThread(formData);
      }} className="space-y-4 border border-green-900 p-6 bg-black">
        <div className="space-y-2">
            <label className="text-green-700 font-bold text-sm">TITLE</label>
            <input
                name="title"
                type="text"
                className="w-full bg-black border border-green-700 p-2 text-green-500 focus:outline-none focus:border-green-400 font-mono"
                required
                placeholder="Brief description of the topic..."
            />
        </div>

        <div className="space-y-2">
            <label className="text-green-700 font-bold text-sm">CATEGORY</label>
            <select name="categoryId" className="w-full bg-black border border-green-700 p-2 text-green-500 focus:outline-none focus:border-green-400 font-mono">
                {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
            </select>
        </div>

        <div className="space-y-2">
            <label className="text-green-700 font-bold text-sm">CONTENT_PAYLOAD (Markdown Supported)</label>
            <textarea
                name="content"
                rows={15}
                className="w-full bg-black border border-green-700 p-2 text-green-500 focus:outline-none focus:border-green-400 font-mono text-sm"
                required
                placeholder="Detailed explanation, code snippets, logs..."
            />
        </div>

        <button type="submit" className="bg-green-800 text-black px-4 py-2 font-bold hover:bg-green-600 w-full">
            [EXECUTE_CREATE]
        </button>
      </form>
    </div>
  );
}

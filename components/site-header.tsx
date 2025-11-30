import Link from 'next/link';
import SearchBar from './search-bar';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-green-900 bg-black/95 backdrop-blur">
      <div className="container flex h-14 items-center pl-8 justify-between">
        <div className="flex items-center">
            <Link href="/" className="mr-6 flex items-center space-x-2 font-bold">
            <span className="text-green-500">{'>'} HACKER_FORUM_</span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link href="/new" className="text-green-400 hover:text-green-300">
                [NEW_THREAD]
            </Link>
            </nav>
        </div>
        <div className="mr-4">
            <SearchBar />
        </div>
      </div>
    </header>
  );
}

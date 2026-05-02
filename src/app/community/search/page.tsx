import { Metadata } from 'next';
import { SearchView } from './search-view';
import { CommunitySidebar } from '@/components/community/community-sidebar';

export const metadata: Metadata = {
  title: 'Search | SOHAM Community',
  description: 'Search posts, communities, and users on the SOHAM community.',
};

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-6">
      <div className="flex gap-6">
        <div className="flex-1 min-w-0">
          <SearchView />
        </div>
        <div className="hidden lg:block w-72 shrink-0">
          <CommunitySidebar />
        </div>
      </div>
    </div>
  );
}

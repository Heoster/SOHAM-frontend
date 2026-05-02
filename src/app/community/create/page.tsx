import { Metadata } from 'next';
import { CreatePostForm } from './create-post-form';
import { CommunitySidebar } from '@/components/community/community-sidebar';

export const metadata: Metadata = {
  title: 'Create Post | SOHAM Community',
  description: 'Share a tip, ask a question, or show off your AI experiments with the SOHAM community.',
};

export default function CreatePostPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-6">
      <div className="flex gap-6">
        <div className="flex-1 min-w-0 max-w-2xl">
          <CreatePostForm />
        </div>
        <div className="hidden lg:block w-72 shrink-0">
          <CommunitySidebar />
        </div>
      </div>
    </div>
  );
}

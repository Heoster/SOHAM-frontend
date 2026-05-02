import { Metadata } from 'next';
import { PostView } from './post-view';
import { CommunitySidebar } from '@/components/community/community-sidebar';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Post | SOHAM Community`,
    description: `View this community post on SOHAM.`,
    alternates: { canonical: `https://soham-ai.vercel.app/community/post/${id}` },
  };
}

export default async function PostPage({ params }: Props) {
  const { id } = await params;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-6">
      <div className="flex gap-6">
        <div className="flex-1 min-w-0">
          <PostView postId={id} />
        </div>
        <div className="hidden lg:block w-72 shrink-0">
          <CommunitySidebar />
        </div>
      </div>
    </div>
  );
}

import { Metadata } from 'next';
import { SubCommunityView } from './sub-community-view';
import { CommunitySidebar } from '@/components/community/community-sidebar';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `c/${slug} | SOHAM Community`,
    description: `Browse posts in the ${slug} community on SOHAM.`,
  };
}

export default async function SubCommunityPage({ params }: Props) {
  const { slug } = await params;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-6">
      <div className="flex gap-6">
        <div className="flex-1 min-w-0">
          <SubCommunityView slug={slug} />
        </div>
        <div className="hidden lg:block w-72 shrink-0">
          <CommunitySidebar activeSub={slug} />
        </div>
      </div>
    </div>
  );
}

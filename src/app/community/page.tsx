import { Metadata } from 'next';
import { CommunityFeed } from './community-feed';
import { CommunitySidebar } from '@/components/community/community-sidebar';

export const metadata: Metadata = {
  title: 'Community | SOHAM — Share, Discuss & Connect',
  description:
    'Join the SOHAM community. Share tips, ask questions, post feedback, and connect with other AI enthusiasts.',
  keywords: ['SOHAM community', 'AI community forum', 'SOHAM users', 'AI discussion'],
  alternates: { canonical: 'https://soham-ai.vercel.app/community' },
  openGraph: {
    title: 'Community | SOHAM',
    description: 'Join the SOHAM community. Share tips, ask questions, and connect with other AI enthusiasts.',
    url: 'https://soham-ai.vercel.app/community',
    type: 'website',
  },
};

export default function CommunityPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-6">
      <div className="flex gap-6">
        {/* Main feed */}
        <div className="flex-1 min-w-0">
          <CommunityFeed />
        </div>

        {/* Sidebar */}
        <div className="hidden lg:block w-72 shrink-0">
          <CommunitySidebar />
        </div>
      </div>
    </div>
  );
}

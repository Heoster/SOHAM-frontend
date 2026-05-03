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
    description: 'Join the SOHAM community. Share tips, ask questions, and connect.',
    url: 'https://soham-ai.vercel.app/community',
    type: 'website',
    images: [{ url: 'https://soham-ai.vercel.app/Multi-Chat.png', width: 1200, height: 630 }],
  },
};

export default function CommunityPage() {
  return (
    <div className="mx-auto max-w-6xl px-3 py-5 md:px-6 md:py-6">
      <div className="flex gap-6">
        <div className="flex-1 min-w-0">
          <CommunityFeed />
        </div>
        <div className="hidden lg:block w-80 shrink-0">
          <CommunitySidebar />
        </div>
      </div>
    </div>
  );
}

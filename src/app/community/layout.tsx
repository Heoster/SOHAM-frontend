import { CommunityTopNav, CommunityBottomNav } from '@/components/community/community-nav';

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <CommunityTopNav />
      <main className="pb-20 md:pb-8">
        {children}
      </main>
      <CommunityBottomNav />
    </div>
  );
}

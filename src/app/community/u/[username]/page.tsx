import { Metadata } from 'next';
import { UserProfileView } from './user-profile-view';
import { CommunitySidebar } from '@/components/community/community-sidebar';

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const name = decodeURIComponent(username);
  return {
    title: `u/${name} | SOHAM Community`,
    description: `View ${name}'s posts and activity on the SOHAM community.`,
  };
}

export default async function UserProfilePage({ params }: Props) {
  const { username } = await params;
  const name = decodeURIComponent(username);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-6">
      <div className="flex gap-6">
        <div className="flex-1 min-w-0">
          <UserProfileView username={name} />
        </div>
        <div className="hidden lg:block w-72 shrink-0">
          <CommunitySidebar />
        </div>
      </div>
    </div>
  );
}

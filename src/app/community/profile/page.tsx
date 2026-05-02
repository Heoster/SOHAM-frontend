'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { LogIn, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProfileRedirectPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user?.displayName) {
      router.replace(`/community/u/${encodeURIComponent(user.displayName)}`);
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mx-auto">
          <User className="h-8 w-8 text-muted-foreground" />
        </div>
        <h1 className="text-xl font-bold">Sign in to view your profile</h1>
        <p className="text-sm text-muted-foreground">
          Create an account to track your posts, karma, and community activity.
        </p>
        <div className="flex gap-3 justify-center">
          <Button asChild className="gap-2">
            <Link href="/login">
              <LogIn className="h-4 w-4" /> Sign In
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/community">Browse Community</Link>
          </Button>
        </div>
      </div>
    );
  }

  return null;
}

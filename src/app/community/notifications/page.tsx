'use client';

import Link from 'next/link';
import { Bell, MessageSquare, Heart, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    type: 'comment',
    icon: MessageSquare,
    color: 'text-blue-500 bg-blue-500/10',
    title: 'Someone replied to your post',
    body: '"Pro tip: Use /solve for step-by-step math"',
    time: '2h ago',
    href: '/community/post/demo-1',
  },
  {
    id: '2',
    type: 'upvote',
    icon: Heart,
    color: 'text-orange-500 bg-orange-500/10',
    title: 'Your post got 5 upvotes',
    body: '"FLUX.1 image generation is stunning"',
    time: '5h ago',
    href: '/community/post/demo-4',
  },
  {
    id: '3',
    type: 'trending',
    icon: TrendingUp,
    color: 'text-green-500 bg-green-500/10',
    title: 'Your post is trending in c/showcase',
    body: '"PDF Analyzer handled a 40-page research paper"',
    time: '1d ago',
    href: '/community/post/demo-2',
  },
];

export default function NotificationsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:px-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold">Notifications</h1>
          <Badge variant="secondary">3</Badge>
        </div>
        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
          Mark all read
        </Button>
      </div>

      <div className="space-y-2">
        {MOCK_NOTIFICATIONS.map((n) => (
          <Link
            key={n.id}
            href={n.href}
            className="flex items-start gap-3 rounded-xl border bg-card p-4 hover:border-primary/40 hover:shadow-sm transition-all group"
          >
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${n.color}`}>
              <n.icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium group-hover:text-primary transition-colors">{n.title}</p>
              <p className="text-xs text-muted-foreground truncate mt-0.5">{n.body}</p>
            </div>
            <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">{n.time}</span>
          </Link>
        ))}
      </div>

      <div className="rounded-xl border bg-card/50 p-4 text-center">
        <p className="text-xs text-muted-foreground">
          Real-time notifications coming soon. Sign in to get notified about replies and upvotes.
        </p>
      </div>
    </div>
  );
}

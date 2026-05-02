'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Send, Loader2, Tag, User, MessageSquare, ChevronDown, ArrowLeft,
  FileText, Hash,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

const SUGGESTED_TAGS = [
  'tip', 'question', 'showcase', 'bug', 'feature-request',
  'prompt', 'coding', 'math', 'voice', 'pdf', 'image-gen', 'announcement',
];

const SUB_OPTIONS = [
  { slug: 'general',        name: 'General',        icon: '💬' },
  { slug: 'tips',           name: 'Tips & Tricks',  icon: '💡' },
  { slug: 'showcase',       name: 'Showcase',       icon: '🎨' },
  { slug: 'help',           name: 'Help & Support', icon: '🙋' },
  { slug: 'feature-ideas',  name: 'Feature Ideas',  icon: '🚀' },
  { slug: 'announcements',  name: 'Announcements',  icon: '📢' },
];

export function CreatePostForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();

  const defaultSub = searchParams?.get('sub') ?? '';

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState(user?.displayName || '');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedSub, setSelectedSub] = useState(defaultSub);
  const [submitting, setSubmitting] = useState(false);

  const toggleTag = (tag: string) =>
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag].slice(0, 4)
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedContent = content.trim();
    if (trimmedContent.length < 10) {
      toast({ title: 'Too short', description: 'Write at least 10 characters.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim() || null,
          content: trimmedContent,
          user_name: authorName.trim() || 'Anonymous',
          user_avatar: user?.photoURL ?? null,
          user_id: user?.uid ?? null,
          tags: selectedTags,
          sub_slug: selectedSub || null,
        }),
      });
      const data = await res.json();
      if (res.ok && data.post) {
        toast({ title: 'Posted! 🎉', description: 'Your post is now live.' });
        router.push(selectedSub ? `/community/c/${selectedSub}` : '/community');
      } else if (res.status === 429) {
        toast({ title: 'Slow down!', description: 'You can post 5 times per 10 minutes.', variant: 'destructive' });
      } else if (res.status === 400 && data.error === 'SPAM_DETECTED') {
        toast({ title: 'Looks like spam', description: 'Please write a genuine post.', variant: 'destructive' });
      } else {
        throw new Error(data.message || 'Failed');
      }
    } catch {
      toast({ title: 'Could not post', description: 'Check your connection and try again.', variant: 'destructive' });
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm" className="gap-2 -ml-2">
          <Link href="/community">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </Button>
        <h1 className="text-xl font-bold">Create a Post</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Community selector */}
        <div className="rounded-xl border bg-card p-4 space-y-3">
          <label className="text-sm font-semibold flex items-center gap-2">
            <Hash className="h-4 w-4 text-muted-foreground" /> Choose a Community
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setSelectedSub('')}
              className={cn(
                'flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all text-left',
                !selectedSub ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/40 text-muted-foreground hover:text-foreground'
              )}
            >
              <span className="text-base">🌐</span>
              <span>General Feed</span>
            </button>
            {SUB_OPTIONS.map((sub) => (
              <button
                key={sub.slug}
                type="button"
                onClick={() => setSelectedSub(sub.slug)}
                className={cn(
                  'flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all text-left',
                  selectedSub === sub.slug ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/40 text-muted-foreground hover:text-foreground'
                )}
              >
                <span className="text-base">{sub.icon}</span>
                <span className="truncate">{sub.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Post content */}
        <div className="rounded-xl border bg-card p-4 space-y-4">
          {/* Author name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-muted-foreground" /> Your Name
            </label>
            <Input
              placeholder="Anonymous"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              maxLength={50}
              className="max-w-xs"
            />
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              Title <span className="text-xs text-muted-foreground font-normal">(optional)</span>
            </label>
            <Input
              placeholder="Give your post a title…"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
            />
          </div>

          {/* Content */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" /> Post Content
            </label>
            <Textarea
              placeholder="Share a tip, ask a question, show off an AI experiment, or give feedback…"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              maxLength={1000}
              className="resize-none"
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{content.length}/1000</p>
              {content.length > 900 && <p className="text-xs text-orange-500">Almost at limit</p>}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5 text-muted-foreground" />
              Tags <span className="text-xs text-muted-foreground font-normal">(up to 4)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-medium transition-all',
                    selectedTags.includes(tag)
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3">
          <Button
            type="submit"
            disabled={submitting || content.trim().length < 10}
            size="lg"
            className="gap-2"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {submitting ? 'Posting…' : 'Post to Community'}
          </Button>
          <Button asChild type="button" variant="outline" size="lg">
            <Link href="/community">Cancel</Link>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">Posts are public and visible to everyone.</p>
      </form>
    </div>
  );
}

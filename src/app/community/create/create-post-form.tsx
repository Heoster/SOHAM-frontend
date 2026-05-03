'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Send, Loader2, Tag, User, MessageSquare, ArrowLeft,
  FileText, Hash, ChevronDown, ChevronUp,
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
  { slug: 'general',       name: 'General',        icon: '💬', desc: 'General discussion' },
  { slug: 'tips',          name: 'Tips & Tricks',  icon: '💡', desc: 'Prompts & workflows' },
  { slug: 'showcase',      name: 'Showcase',       icon: '🎨', desc: 'AI experiments' },
  { slug: 'help',          name: 'Help & Support', icon: '🙋', desc: 'Ask questions' },
  { slug: 'feature-ideas', name: 'Feature Ideas',  icon: '🚀', desc: 'Suggest features' },
  { slug: 'announcements', name: 'Announcements',  icon: '📢', desc: 'Official updates' },
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
  const [showTags, setShowTags] = useState(false);

  const toggleTag = (tag: string) =>
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag].slice(0, 4)
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
        <Button asChild variant="ghost" size="sm" className="gap-1.5 -ml-2 text-muted-foreground">
          <Link href="/community">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </Button>
        <h1 className="text-xl font-bold">Create a Post</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">

        {/* Community selector */}
        <div className="rounded-xl border border-border/60 bg-card p-4 space-y-3">
          <label className="text-sm font-semibold flex items-center gap-2">
            <Hash className="h-4 w-4 text-muted-foreground" />
            Choose a Community
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setSelectedSub('')}
              className={cn(
                'flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all text-left',
                !selectedSub
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border/60 hover:border-primary/40 text-muted-foreground hover:text-foreground'
              )}
            >
              <span className="text-base">🌐</span>
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate">General Feed</p>
                <p className="text-[10px] text-muted-foreground">All communities</p>
              </div>
            </button>
            {SUB_OPTIONS.map(sub => (
              <button
                key={sub.slug}
                type="button"
                onClick={() => setSelectedSub(sub.slug)}
                className={cn(
                  'flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all text-left',
                  selectedSub === sub.slug
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border/60 hover:border-primary/40 text-muted-foreground hover:text-foreground'
                )}
              >
                <span className="text-base">{sub.icon}</span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate">{sub.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{sub.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Post content */}
        <div className="rounded-xl border border-border/60 bg-card p-4 space-y-4">

          {/* Author */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium flex items-center gap-1.5 text-muted-foreground">
              <User className="h-3.5 w-3.5" /> Your Name
            </label>
            <Input
              placeholder="Anonymous"
              value={authorName}
              onChange={e => setAuthorName(e.target.value)}
              maxLength={50}
              className="max-w-xs rounded-lg border-border/60"
            />
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium flex items-center gap-1.5 text-muted-foreground">
              <FileText className="h-3.5 w-3.5" />
              Title
              <span className="text-xs font-normal">(optional)</span>
            </label>
            <Input
              placeholder="Give your post a descriptive title…"
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={200}
              className="rounded-lg border-border/60"
            />
          </div>

          {/* Content */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium flex items-center gap-1.5 text-muted-foreground">
              <MessageSquare className="h-3.5 w-3.5" /> Post Content
            </label>
            <Textarea
              placeholder="Share a tip, ask a question, show off an AI experiment, or give feedback…"
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={6}
              maxLength={1000}
              className="resize-none rounded-lg border-border/60"
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{content.length}/1000</p>
              {content.length > 900 && <p className="text-xs text-orange-500 font-medium">Almost at limit</p>}
            </div>
          </div>

          {/* Tags — collapsible */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setShowTags(v => !v)}
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <Tag className="h-3.5 w-3.5" />
              Tags
              {selectedTags.length > 0 && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 ml-1">
                  {selectedTags.length}
                </Badge>
              )}
              {showTags ? <ChevronUp className="h-3.5 w-3.5 ml-auto" /> : <ChevronDown className="h-3.5 w-3.5 ml-auto" />}
            </button>
            {showTags && (
              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTED_TAGS.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={cn(
                      'rounded-full border px-3 py-1 text-xs font-medium transition-all',
                      selectedTags.includes(tag)
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border/60 text-muted-foreground hover:border-primary/50 hover:text-foreground'
                    )}
                  >
                    {tag}
                  </button>
                ))}
                <p className="w-full text-[10px] text-muted-foreground">Up to 4 tags</p>
              </div>
            )}
            {selectedTags.length > 0 && !showTags && (
              <div className="flex flex-wrap gap-1.5">
                {selectedTags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-[10px] gap-1 rounded-full">
                    <Tag className="h-2.5 w-2.5" />{tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3">
          <Button
            type="submit"
            disabled={submitting || content.trim().length < 10}
            size="lg"
            className="gap-2 rounded-full px-8"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {submitting ? 'Posting…' : 'Post to Community'}
          </Button>
          <Button asChild type="button" variant="outline" size="lg" className="rounded-full">
            <Link href="/community">Cancel</Link>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">Posts are public and visible to everyone.</p>
      </form>
    </div>
  );
}

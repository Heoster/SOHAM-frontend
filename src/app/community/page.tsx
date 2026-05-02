import { Metadata } from 'next';
import { DEVELOPER_INFO } from '@/lib/developer-info';
import { PageHeader } from '@/components/page-header';
import { CommunityBoard } from './community-board';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Users,
  MessageSquare,
  Star,
  Zap,
  ArrowRight,
  Globe,
  Shield,
  HelpCircle,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Community | SOHAM by CODEEX-AI — Share, Discuss & Connect',
  description:
    'Join the SOHAM community. Share tips, ask questions, post feedback, and connect with other AI enthusiasts. Powered by Supabase for real-time interaction.',
  keywords: [
    'SOHAM community',
    'CODEEX-AI community',
    'AI community forum',
    'SOHAM users',
    'AI discussion',
    'share AI tips',
    'SOHAM feedback',
    'AI chat community',
    'free AI forum',
    'SOHAM posts',
  ],
  alternates: { canonical: 'https://soham-ai.vercel.app/community' },
  openGraph: {
    title: 'Community | SOHAM by CODEEX-AI',
    description: 'Join the SOHAM community. Share tips, ask questions, and connect with other AI enthusiasts.',
    url: 'https://soham-ai.vercel.app/community',
    type: 'website',
    siteName: 'SOHAM',
    images: [{ url: 'https://soham-ai.vercel.app/Multi-Chat.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Community | SOHAM by CODEEX-AI',
    description: 'Join the SOHAM community. Share tips, ask questions, and connect.',
  },
};

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageHeader backLink="/" backText="Back to Home" title="Community" />

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'SOHAM Community',
            url: 'https://soham-ai.vercel.app/community',
            description: 'Community discussion board for SOHAM users. Share tips, ask questions, and connect.',
            isPartOf: { '@type': 'WebSite', name: 'SOHAM', url: 'https://soham-ai.vercel.app' },
            breadcrumb: {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://soham-ai.vercel.app' },
                { '@type': 'ListItem', position: 2, name: 'Community', item: 'https://soham-ai.vercel.app/community' },
              ],
            },
          }),
        }}
      />

      <main className="container mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12 space-y-10">

        {/* ── Hero ── */}
        <section className="relative overflow-hidden rounded-[2rem] border bg-card p-8 md:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.10),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.08),transparent_40%)]" />
          <div className="relative grid gap-8 lg:grid-cols-[1.4fr_0.6fr] lg:items-center">
            <div className="space-y-4">
              <Badge variant="outline" className="gap-2">
                <Globe className="h-3.5 w-3.5 text-primary" />
                Open to everyone — no account required to read
              </Badge>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                The <span className="text-primary">SOHAM</span> Community
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
                Share tips, ask questions, post your AI experiments, and connect with other SOHAM users.
                Every post is public and helps build a knowledge base for the whole community.
              </p>
              <div className="flex flex-wrap gap-3 pt-1">
                <a href="#post-form">
                  <Button size="lg" className="gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Post Something
                  </Button>
                </a>
                <Link href="/faq">
                  <Button size="lg" variant="outline" className="gap-2">
                    <HelpCircle className="h-4 w-4" />
                    Browse FAQ
                  </Button>
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Public Posts', value: 'Open', icon: Globe },
                { label: 'Real-time', value: 'Live', icon: Zap },
                { label: 'Moderated', value: 'Safe', icon: Shield },
                { label: 'Community', value: 'Free', icon: Star },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl border bg-background/80 p-4 text-center">
                  <s.icon className="h-4 w-4 text-primary mx-auto mb-1.5" />
                  <p className="text-xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Guidelines ── */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Star, title: 'Be Helpful', desc: 'Share tips, prompts, and discoveries that help others get more from SOHAM.' },
            { icon: MessageSquare, title: 'Ask Questions', desc: 'No question is too basic. The community is here to help.' },
            { icon: Shield, title: 'Be Respectful', desc: 'Keep it constructive. No spam, hate speech, or personal attacks.' },
            { icon: Zap, title: 'Share Experiments', desc: 'Post interesting AI outputs, use cases, and creative prompts.' },
          ].map((g) => (
            <Card key={g.title} className="border-border/60">
              <CardContent className="p-5 space-y-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <g.icon className="h-4 w-4 text-primary" />
                </div>
                <p className="font-semibold text-sm">{g.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{g.desc}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* ── Interactive board (client component) ── */}
        <CommunityBoard />

        {/* ── Related links ── */}
        <section className="rounded-[2rem] border bg-card p-6 md:p-8">
          <h2 className="text-xl font-bold mb-4">More Ways to Connect</h2>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {[
              { label: 'Contact Support', href: '/contact', icon: MessageSquare, desc: 'Direct message to the team' },
              { label: 'FAQ', href: '/faq', icon: HelpCircle, desc: 'Quick answers to common questions' },
              { label: 'Documentation', href: '/documentation', icon: Star, desc: 'Full feature guides' },
              { label: 'AI Chat', href: '/chat', icon: Zap, desc: 'Start chatting with SOHAM' },
              { label: 'About Heoster', href: '/about', icon: Users, desc: 'Meet the founder' },
              {
                label: 'GitHub',
                href: DEVELOPER_INFO.contact.github,
                icon: Globe,
                desc: 'Open source contributions',
                external: true,
              },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                target={'external' in link && link.external ? '_blank' : undefined}
                rel={'external' in link && link.external ? 'noopener noreferrer' : undefined}
                className="group flex items-start gap-3 rounded-xl border bg-background/60 p-3 transition-all hover:border-primary/40 hover:bg-background"
              >
                <link.icon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium group-hover:text-primary transition-colors">{link.label}</p>
                  <p className="text-xs text-muted-foreground">{link.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}

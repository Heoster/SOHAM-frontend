import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CalendarDays, ShieldCheck, Workflow, Wrench } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/page-header';

export const metadata: Metadata = {
  title: 'Blog | SOHAM Product Notes and Build Updates',
  description: 'Read product notes for SOHAM by CODEEX-AI: workspace updates, routing fixes, security changes, docs updates, and feature rollouts.',
  keywords: ['SOHAM blog', 'SOHAM product updates', 'CODEEX-AI updates', 'AI workspace updates', 'SOHAM routing', 'SOHAM security'],
  alternates: { canonical: 'https://soham-ai.vercel.app/blog' },
  openGraph: {
    title: 'Blog | SOHAM Product Notes and Build Updates',
    description: 'Product notes for the live SOHAM app: route changes, security work, and feature updates.',
    url: 'https://soham-ai.vercel.app/blog',
    siteName: 'SOHAM',
    images: [{ url: 'https://soham-ai.vercel.app/Multi-Chat.png', width: 1200, height: 630, alt: 'SOHAM product notes' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog | SOHAM Product Notes and Build Updates',
    description: 'Product notes for the live SOHAM app: route changes, security work, and feature updates.',
    images: ['https://soham-ai.vercel.app/Multi-Chat.png'],
  },
};

const notes = [
  {
    title: 'Workspace routes were tightened around protected access',
    date: 'April 2026',
    tag: 'Security',
    icon: ShieldCheck,
    summary:
      'Chat, AI Services, PDF Analyzer, and Image Math Solver now sit behind login-aware route protection so the main tools behave like one private workspace.',
    points: [
      'Protected routes now send unauthenticated users through the login flow with a return path.',
      'The app keeps settings in one place and exposes quick settings inside the chat shell.',
      'Local chat storage remains visible as a user-control feature instead of being hidden behind generic marketing copy.',
    ],
  },
  {
    title: 'Landing page was rebuilt around the actual SOHAM brand system',
    date: 'April 2026',
    tag: 'Design',
    icon: Workflow,
    summary:
      'The public site now uses the colored SOHAM logo, a cleaner route hierarchy, and product copy that matches the current app instead of a generic AI landing page.',
    points: [
      'Desktop and mobile hero sections are now separate components under one SEO-safe URL.',
      'The landing page explains the route structure, company context, and security position before asking users to sign in.',
      'Navigation now emphasizes AI Services, documentation, blog, and the real product pages.',
    ],
  },
  {
    title: 'Routing and loading behavior were simplified for faster navigation',
    date: 'April 2026',
    tag: 'Performance',
    icon: Wrench,
    summary:
      'Artificial route remounts and slow overlay behavior were reduced so navigation feels closer to an app shell and less like a full-page reload.',
    points: [
      'The global loading overlay now appears only during initial app startup instead of on every route change.',
      'Page transitions no longer force a remount of the full route tree on each navigation.',
      'A global loading skeleton was added for streamed route loading instead of delaying the interface with a fixed timer.',
    ],
  },
];

const blogSchema = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  name: 'SOHAM Product Notes',
  description: 'Build notes and release updates for SOHAM by CODEEX-AI',
  url: 'https://soham-ai.vercel.app/blog',
  publisher: {
    '@type': 'Organization',
    name: 'CODEEX-AI',
    logo: { '@type': 'ImageObject', url: 'https://soham-ai.vercel.app/FINALSOHAM.png' },
  },
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }} />
      <PageHeader backLink="/" backText="Back to Home" title="Blog" />

      <main className="container mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-12">
        <section className="mb-10 space-y-4 text-center">
          <Badge variant="secondary" className="px-4 py-1 text-xs uppercase tracking-[0.16em]">
            SOHAM Product Notes
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Build updates tied to the live app</h1>
          <p className="mx-auto max-w-3xl text-lg text-muted-foreground">
            This page tracks changes that affect the current SOHAM product: route behavior, protected tools, landing page work,
            documentation accuracy, and app shell stability.
          </p>
        </section>

        <section className="grid gap-6">
          {notes.map((note) => {
            const Icon = note.icon;

            return (
              <Card key={note.title} className="overflow-hidden">
                <CardHeader className="space-y-4 border-b bg-muted/20">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="rounded-2xl bg-primary/10 p-2 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <Badge variant="outline">{note.tag}</Badge>
                    <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarDays className="h-4 w-4" />
                      {note.date}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <CardTitle className="text-2xl">{note.title}</CardTitle>
                    <p className="text-sm leading-7 text-muted-foreground">{note.summary}</p>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <ul className="space-y-3 text-sm leading-7 text-muted-foreground">
                    {note.points.map((point) => (
                      <li key={point} className="flex gap-3">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <section className="mt-12 rounded-2xl border bg-muted/30 p-6 text-center">
          <h2 className="text-2xl font-bold">Continue through the live product</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground">
            Open <Link href="/documentation" className="font-medium text-foreground hover:underline">documentation</Link> for the current route map,
            review the <Link href="/soham" className="font-medium text-foreground hover:underline">SOHAM product page</Link>,
            or go directly to <Link href="/chat" className="font-medium text-foreground hover:underline">AI chat</Link> if you are ready to use the workspace.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/documentation">
              <Button variant="outline">
                Open Documentation
              </Button>
            </Link>
            <Link href="/login">
              <Button>
                Launch SOHAM
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

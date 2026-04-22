'use client';

import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  FileText,
  LockKeyhole,
  MessageSquare,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Calculator,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const primaryGuides = [
  {
    title: 'Chat Workspace',
    description: 'How SOHAM handles model selection, response structure, local history, and protected chat access.',
    href: '/documentation/chat',
    icon: MessageSquare,
    badge: 'Core',
  },
  {
    title: 'PDF Analyzer',
    description: 'Upload limits, document workflow, supported file handling, and the real PDF route in the app.',
    href: '/documentation/pdf-analysis',
    icon: FileText,
    badge: 'Core',
  },
  {
    title: 'Image Math Solver',
    description: 'How equation images are processed, what works best, and when to switch back to chat.',
    href: '/documentation/math-solver',
    icon: Calculator,
    badge: 'Core',
  },
  {
    title: 'Web Search',
    description: 'How search-assisted answers fit into the app flow and when the system should rely on live sources.',
    href: '/documentation/web-search',
    icon: Search,
    badge: 'Live Data',
  },
];

const operationsGuides = [
  {
    title: 'Quick Start',
    description: 'The fastest route from landing page to using chat, AI Services, and account-protected tools.',
    href: '/documentation/quick-start',
  },
  {
    title: 'Settings',
    description: 'Unified settings, quick settings access, and how preferences are stored for the active user.',
    href: '/documentation/settings',
  },
  {
    title: 'Security',
    description: 'Protected routes, account access, and why local chat storage is surfaced as a visible user-control feature.',
    href: '/documentation/security',
  },
  {
    title: 'API Reference',
    description: 'Real endpoints, request constraints, and the current route surface exposed by the application.',
    href: '/documentation/api-reference',
  },
];

export default function DocsHomePage() {
  return (
    <div className="space-y-10">
      <section className="space-y-5">
        <div className="inline-flex items-center gap-2 rounded-full border bg-muted px-4 py-2 text-sm">
          <BookOpen className="h-4 w-4 text-primary" />
          <span className="font-medium">SOHAM Documentation</span>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Documentation for the current SOHAM app</h1>
          <p className="max-w-3xl text-lg text-muted-foreground">
            This documentation now describes the routes, workflows, and constraints that actually exist in the app:
            protected chat, AI Services, PDF Analyzer, Image Math Solver, unified settings, and local chat storage.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/chat">
            <Button size="lg">
              Open Chat
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/ai-services">
            <Button size="lg" variant="outline">
              Open AI Services
            </Button>
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="border-primary/20 bg-primary/5 md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Product structure
            </CardTitle>
            <CardDescription>The public docs should match the real route tree and access model.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              The main public entry points are <Link href="/" className="font-medium text-foreground hover:underline">landing page</Link>,{' '}
              <Link href="/features" className="font-medium text-foreground hover:underline">features</Link>,{' '}
              <Link href="/documentation" className="font-medium text-foreground hover:underline">documentation</Link>, and{' '}
              <Link href="/blog" className="font-medium text-foreground hover:underline">blog</Link>.
            </p>
            <p>
              The protected workspace routes are <Link href="/chat" className="font-medium text-foreground hover:underline">AI chat</Link>,{' '}
              <Link href="/ai-services" className="font-medium text-foreground hover:underline">AI Services</Link>,{' '}
              <Link href="/pdf-analyzer" className="font-medium text-foreground hover:underline">PDF Analyzer</Link>, and{' '}
              <Link href="/visual-math" className="font-medium text-foreground hover:underline">Image Math Solver</Link>.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LockKeyhole className="h-5 w-5 text-primary" />
              Current security position
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Core tools require login.</p>
            <p>Local chat storage remains visible as a product-level security and control feature.</p>
            <p>Settings are grouped into one settings surface with quick access from the workspace.</p>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Core product guides</h2>
            <p className="text-sm text-muted-foreground">These routes map directly to the features users see in the app today.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {primaryGuides.map((guide) => {
            const Icon = guide.icon;

            return (
              <Link key={guide.href} href={guide.href}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="rounded-2xl bg-primary/10 p-2 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{guide.title}</CardTitle>
                          <Badge variant="secondary">{guide.badge}</Badge>
                        </div>
                        <CardDescription>{guide.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold">Operations and reference</h2>
          <p className="text-sm text-muted-foreground">The routes below cover setup, settings, support, and technical details.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {operationsGuides.map((guide) => (
            <Link key={guide.href} href={guide.href}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Sparkles className="h-4 w-4 text-primary" />
                    {guide.title}
                  </CardTitle>
                  <CardDescription>{guide.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border bg-muted/40 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Need the full product context first?</h2>
            <p className="text-sm text-muted-foreground">
              Read the <Link href="/soham" className="font-medium text-foreground hover:underline">SOHAM product page</Link>, review{' '}
              <Link href="/about" className="font-medium text-foreground hover:underline">CODEEX-AI and Heoster</Link>, or check the{' '}
              <Link href="/blog" className="font-medium text-foreground hover:underline">latest product notes</Link>.
            </p>
          </div>

          <div className="flex gap-3">
            <Link href="/documentation/settings">
              <Button variant="outline" className="gap-2">
                <Settings2 className="h-4 w-4" />
                Settings Guide
              </Button>
            </Link>
            <Link href="/documentation/faq">
              <Button className="gap-2">
                FAQ
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

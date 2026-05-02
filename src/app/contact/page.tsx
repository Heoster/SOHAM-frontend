import { Metadata } from 'next';
import Link from 'next/link';
import { pageSEO, structuredData } from '@/lib/seo-config';
import { DEVELOPER_INFO } from '@/lib/developer-info';
import { PageHeader } from '@/components/page-header';
import { ContactForm } from './contact-form';
import {
  Mail,
  Github,
  Linkedin,
  Twitter,
  MapPin,
  Clock,
  MessageSquare,
  HelpCircle,
  BookOpen,
  Users,
  ArrowRight,
  Zap,
  Shield,
  Star,
  ExternalLink,
  Phone,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Contact SOHAM | Get Support, Send Feedback & Connect with CODEEX-AI',
  description:
    'Contact the SOHAM team at CODEEX-AI. Reach Heoster for support, feedback, bug reports, partnerships, or general questions. Email, LinkedIn, GitHub, and Twitter available.',
  keywords: [
    ...pageSEO.contact.keywords,
    'SOHAM support',
    'CODEEX-AI contact',
    'Heoster contact',
    'AI platform support',
    'bug report',
    'feature request',
    'partnership',
  ],
  alternates: { canonical: 'https://soham-ai.vercel.app/contact' },
  openGraph: {
    title: 'Contact SOHAM | CODEEX-AI',
    description: pageSEO.contact.description,
    url: 'https://soham-ai.vercel.app/contact',
    type: 'website',
    siteName: 'SOHAM',
    images: [{ url: 'https://soham-ai.vercel.app/Multi-Chat.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact SOHAM | CODEEX-AI',
    description: pageSEO.contact.description,
  },
};

const contactChannels = [
  {
    icon: Mail,
    label: 'Email',
    value: DEVELOPER_INFO.contact.email,
    href: `mailto:${DEVELOPER_INFO.contact.email}`,
    description: 'Best for detailed questions, bug reports, and partnerships.',
    responseTime: 'Usually within 24 hours',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    icon: Github,
    label: 'GitHub',
    value: `@${DEVELOPER_INFO.social.github}`,
    href: DEVELOPER_INFO.contact.github,
    description: 'Open issues, contribute code, or browse the source.',
    responseTime: 'Monitored daily',
    color: 'text-foreground',
    bg: 'bg-foreground/10',
    external: true,
  },
  {
    icon: Linkedin,
    label: 'LinkedIn',
    value: 'Heoster / CODEEX-AI',
    href: DEVELOPER_INFO.contact.linkedin,
    description: 'Professional inquiries, collaborations, and networking.',
    responseTime: 'Usually within 48 hours',
    color: 'text-sky-500',
    bg: 'bg-sky-500/10',
    external: true,
  },
  {
    icon: Twitter,
    label: 'X (Twitter)',
    value: `@${DEVELOPER_INFO.social.Twitter}`,
    href: DEVELOPER_INFO.contact.twitter,
    description: 'Quick questions, updates, and community chat.',
    responseTime: 'Fastest response',
    color: 'text-foreground',
    bg: 'bg-foreground/10',
    external: true,
  },
];

const supportTopics = [
  {
    icon: HelpCircle,
    title: 'General Support',
    description: 'Questions about using SOHAM, features, or getting started.',
    link: '/faq',
    linkText: 'Browse FAQ first',
  },
  {
    icon: Zap,
    title: 'Bug Reports',
    description: 'Found something broken? Describe the issue and steps to reproduce.',
    link: `mailto:${DEVELOPER_INFO.contact.email}?subject=Bug Report`,
    linkText: 'Report a bug',
  },
  {
    icon: Star,
    title: 'Feature Requests',
    description: 'Have an idea to make SOHAM better? We want to hear it.',
    link: `mailto:${DEVELOPER_INFO.contact.email}?subject=Feature Request`,
    linkText: 'Suggest a feature',
  },
  {
    icon: Users,
    title: 'Partnerships',
    description: 'Interested in collaborating, integrating, or sponsoring SOHAM?',
    link: `mailto:${DEVELOPER_INFO.contact.email}?subject=Partnership Inquiry`,
    linkText: 'Get in touch',
  },
  {
    icon: Shield,
    title: 'Privacy & Security',
    description: 'Security vulnerabilities, data concerns, or privacy questions.',
    link: '/privacy',
    linkText: 'Read privacy policy',
  },
  {
    icon: BookOpen,
    title: 'Documentation',
    description: 'Need help understanding a feature? Check the docs first.',
    link: '/documentation',
    linkText: 'Open docs',
  },
];

const faqHighlights = [
  { q: 'Is SOHAM completely free?', a: 'Yes — all 35+ models, voice, PDF analysis, and image generation are free forever. No credit card, no subscription.' },
  { q: 'How do I install SOHAM on my phone?', a: 'Android: Chrome → menu → "Add to Home screen". iOS: Safari → share → "Add to Home Screen". Works as a full PWA.' },
  { q: 'Which AI model should I use?', a: 'Use Auto mode — it picks the best model for your query automatically. For coding, DeepSeek is best. For speed, Groq Llama.' },
  { q: 'Does SOHAM store my conversations?', a: 'Conversations are stored locally in your browser only. We do not log or monitor your chats on our servers.' },
  { q: 'How do I report a bug or request a feature?', a: 'Use the contact form below or email us directly. Include as much detail as possible for bug reports.' },
  { q: 'Can I use SOHAM for commercial projects?', a: 'Yes, SOHAM is free to use for personal and commercial projects. See our Terms of Service for full details.' },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageHeader backLink="/" backText="Back to Home" title="Contact" />

      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ContactPage',
            name: 'Contact SOHAM',
            url: 'https://soham-ai.vercel.app/contact',
            description: 'Contact the SOHAM team at CODEEX-AI for support, feedback, and partnerships.',
            mainEntity: {
              '@type': 'Organization',
              name: 'CODEEX-AI',
              email: DEVELOPER_INFO.contact.email,
              url: 'https://soham-ai.vercel.app',
              contactPoint: {
                '@type': 'ContactPoint',
                email: DEVELOPER_INFO.contact.email,
                contactType: 'Customer Support',
                availableLanguage: ['English', 'Hindi'],
                areaServed: 'Worldwide',
              },
              sameAs: [
                DEVELOPER_INFO.contact.github,
                DEVELOPER_INFO.contact.linkedin,
                DEVELOPER_INFO.contact.twitter,
              ],
            },
          }),
        }}
      />

      <main className="container mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12 space-y-12">

        {/* ── Hero ── */}
        <section className="relative overflow-hidden rounded-[2rem] border bg-card p-8 md:p-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.10),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.10),transparent_40%)]" />
          <div className="relative grid gap-8 lg:grid-cols-2 lg:items-center">
            <div className="space-y-4">
              <Badge variant="outline" className="gap-2 text-sm">
                <MessageSquare className="h-3.5 w-3.5 text-primary" />
                We respond to every message
              </Badge>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                Get in Touch with <span className="text-primary">SOHAM</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Whether you have a question, found a bug, want to collaborate, or just want to say hi —
                we&apos;re here. SOHAM is built by one developer who genuinely reads every message.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link href={`mailto:${DEVELOPER_INFO.contact.email}`}>
                  <Button size="lg" className="gap-2">
                    <Mail className="h-4 w-4" />
                    Email Us
                  </Button>
                </Link>
                <Link href="/community">
                  <Button size="lg" variant="outline" className="gap-2">
                    <Users className="h-4 w-4" />
                    Community
                  </Button>
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Response Time', value: '< 24h', icon: Clock },
                { label: 'Support Channels', value: '4+', icon: MessageSquare },
                { label: 'Languages', value: 'EN / HI', icon: MapPin },
                { label: 'Availability', value: '24/7', icon: Zap },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border bg-background/80 p-4 text-center">
                  <stat.icon className="h-5 w-5 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Contact Channels ── */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Contact Channels</h2>
          <p className="text-muted-foreground">Choose the channel that works best for your question.</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {contactChannels.map((ch) => (
              <Link
                key={ch.label}
                href={ch.href}
                target={ch.external ? '_blank' : undefined}
                rel={ch.external ? 'noopener noreferrer' : undefined}
                className="group block"
              >
                <Card className="h-full transition-all duration-200 hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5">
                  <CardContent className="p-5 space-y-3">
                    <div className={`inline-flex items-center justify-center h-10 w-10 rounded-xl ${ch.bg}`}>
                      <ch.icon className={`h-5 w-5 ${ch.color}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="font-semibold">{ch.label}</p>
                        {ch.external && <ExternalLink className="h-3 w-3 text-muted-foreground" />}
                      </div>
                      <p className="text-sm text-primary font-medium">{ch.value}</p>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{ch.description}</p>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {ch.responseTime}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Support Topics + Contact Form ── */}
        <section className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          {/* Support topics */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">What can we help with?</h2>
            <div className="space-y-3">
              {supportTopics.map((topic) => (
                <Link key={topic.title} href={topic.link} className="group block">
                  <div className="flex items-start gap-4 rounded-2xl border bg-card p-4 transition-all hover:border-primary/40 hover:bg-card/80">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <topic.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{topic.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{topic.description}</p>
                      <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary group-hover:underline">
                        {topic.linkText}
                        <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Contact form */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Send a Message</h2>
            <p className="text-muted-foreground text-sm">
              Fill out the form and we&apos;ll get back to you as soon as possible.
            </p>
            <ContactForm />
          </div>
        </section>

        {/* ── FAQ Highlights ── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Quick Answers</h2>
              <p className="text-muted-foreground text-sm mt-1">Common questions — answered instantly.</p>
            </div>
            <Link href="/faq">
              <Button variant="outline" size="sm" className="gap-2">
                Full FAQ
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {faqHighlights.map((item) => (
              <Card key={item.q} className="h-full">
                <CardContent className="p-5 space-y-2">
                  <p className="font-semibold text-sm leading-snug">{item.q}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center pt-2">
            <Link href="/faq">
              <Button variant="outline" className="gap-2">
                <HelpCircle className="h-4 w-4" />
                View All Frequently Asked Questions
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>

        {/* ── Location & About ── */}
        <section className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Where We&apos;re Based
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                SOHAM is built and maintained by <strong className="text-foreground">Heoster (Harsh)</strong>,
                a {DEVELOPER_INFO.age}-year-old developer from{' '}
                <strong className="text-foreground">{DEVELOPER_INFO.location.city}, {DEVELOPER_INFO.location.state}, India</strong>.
              </p>
              <p>
                CODEEX-AI was founded in {DEVELOPER_INFO.company.founded} with the mission to make advanced AI
                tools accessible to every student and developer, regardless of background or resources.
              </p>
              <p>
                The platform currently serves users in <strong className="text-foreground">100+ countries</strong> with{' '}
                <strong className="text-foreground">99.9% uptime</strong>.
              </p>
              <Link href="/about">
                <Button variant="outline" size="sm" className="mt-2 gap-2">
                  Learn more about Heoster
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Response Times & Availability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { channel: 'Email', time: 'Within 24 hours', note: 'Detailed support' },
                { channel: 'X (Twitter)', time: 'Within a few hours', note: 'Quick questions' },
                { channel: 'LinkedIn', time: 'Within 48 hours', note: 'Professional inquiries' },
                { channel: 'GitHub Issues', time: 'Within 24 hours', note: 'Bug reports & PRs' },
              ].map((row) => (
                <div key={row.channel} className="flex items-center justify-between rounded-xl border bg-muted/30 px-4 py-2.5">
                  <div>
                    <p className="text-sm font-medium">{row.channel}</p>
                    <p className="text-xs text-muted-foreground">{row.note}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">{row.time}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        {/* ── Useful Links ── */}
        <section className="rounded-[2rem] border bg-card p-6 md:p-8">
          <h2 className="text-xl font-bold mb-4">Useful Links</h2>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[
              { label: 'FAQ', href: '/faq', icon: HelpCircle, desc: 'Common questions answered' },
              { label: 'Documentation', href: '/documentation', icon: BookOpen, desc: 'Full feature guides' },
              { label: 'Community', href: '/community', icon: Users, desc: 'Share & discuss with users' },
              { label: 'AI Chat', href: '/chat', icon: MessageSquare, desc: 'Start chatting now' },
              { label: 'AI Services', href: '/ai-services', icon: Zap, desc: 'All AI tools' },
              { label: 'Privacy Policy', href: '/privacy', icon: Shield, desc: 'How we protect your data' },
              { label: 'About Heoster', href: '/about', icon: Star, desc: 'The founder story' },
              { label: 'GitHub', href: DEVELOPER_INFO.contact.github, icon: Github, desc: 'Source & issues', external: true },
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

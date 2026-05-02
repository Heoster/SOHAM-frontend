import { Metadata } from 'next';
import Link from 'next/link';
import { structuredData, pageSEO } from '@/lib/seo-config';
import { DEVELOPER_INFO } from '@/lib/developer-info';
import { PageHeader } from '@/components/page-header';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  HelpCircle,
  Cpu,
  MessageSquare,
  Settings,
  Shield,
  Smartphone,
  Zap,
  ArrowRight,
  Users,
  BookOpen,
  Star,
  Search,
  Code2,
  Globe,
  Lock,
  Mic,
  Image as ImageIcon,
  FileText,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'FAQ — Frequently Asked Questions | SOHAM by CODEEX-AI',
  description:
    'Find answers to the most common questions about SOHAM: free AI models, features, voice, PDF analysis, image generation, privacy, mobile PWA, and troubleshooting.',
  keywords: [
    'SOHAM FAQ',
    'SOHAM frequently asked questions',
    'CODEEX-AI FAQ',
    'AI chatbot FAQ',
    'free AI FAQ',
    'SOHAM help',
    'SOHAM support',
    'AI models questions',
    'how to use SOHAM',
    'SOHAM troubleshooting',
    'SOHAM voice',
    'SOHAM PDF',
    'SOHAM image generation',
    'SOHAM privacy',
    'SOHAM PWA',
  ],
  alternates: { canonical: 'https://soham-ai.vercel.app/faq' },
  openGraph: {
    title: 'FAQ | SOHAM by CODEEX-AI',
    description: 'Answers to the most common questions about SOHAM — free AI, models, features, and troubleshooting.',
    url: 'https://soham-ai.vercel.app/faq',
    type: 'website',
    siteName: 'SOHAM',
    images: [{ url: 'https://soham-ai.vercel.app/Multi-Chat.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FAQ | SOHAM by CODEEX-AI',
    description: 'Answers to the most common questions about SOHAM.',
  },
};

// ── FAQ data ──────────────────────────────────────────────────────────────────

const sections = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: Zap,
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10',
    questions: [
      {
        q: 'What is SOHAM?',
        a: 'SOHAM (Self Organising Hyper Adaptive Machine) is a free, multi-model AI assistant built by Heoster at CODEEX-AI. It gives you access to 35+ AI models from Groq, Google, Cerebras, HuggingFace, and OpenRouter through a single interface — with smart auto-routing, voice features, PDF analysis, image generation, and real-time web search. The name is also inspired by the Sanskrit mantra Soham (So Hum), meaning "I am That."',
      },
      {
        q: 'Is SOHAM completely free?',
        a: 'Yes — completely free, forever. All core features including 35+ AI models, image generation, web search, voice, and PDF analysis are free with no hidden fees, no subscriptions, and no credit card required. Heoster\'s mission is to democratize AI access for every student and developer.',
      },
      {
        q: 'Do I need to create an account?',
        a: 'No account is required for basic usage. Creating a free account lets you save conversation history across devices, sync settings, and access personalized features. Sign up is optional and always free.',
      },
      {
        q: 'What can I ask SOHAM?',
        a: 'Anything: coding help, math problems, general knowledge, homework, document analysis, image generation, web searches, creative writing, debugging, architecture advice, translations, summaries, and more. The AI adapts to your query automatically using smart routing.',
      },
      {
        q: 'What does "SOHAM" mean?',
        a: 'SOHAM has two meanings. In the product, it stands for "Self Organising Hyper Adaptive Machine." The name is also inspired by the Sanskrit mantra Soham (So Hum), meaning "I am That" — representing unity of individual self with universal consciousness. Heoster chose this name to give the product both technical identity and human depth.',
      },
      {
        q: 'Who built SOHAM?',
        a: `SOHAM was built by Heoster (Harsh), a ${DEVELOPER_INFO.age}-year-old developer from ${DEVELOPER_INFO.location.city}, India. He founded CODEEX-AI in ${DEVELOPER_INFO.company.founded} and built SOHAM as the flagship product. You can learn more on the About page.`,
      },
    ],
  },
  {
    id: 'ai-models',
    title: 'AI Models & Selection',
    icon: Cpu,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    questions: [
      {
        q: 'How many AI models are available?',
        a: 'SOHAM provides access to 35+ AI models from Groq (Llama 3.1 8B Instant, Llama 3.3 70B, Mixtral 8x7B), Google (Gemini 2.5 Flash, Gemini Flash Latest), Cerebras (Qwen 3 235B Instruct, GLM 4.7), HuggingFace (DeepSeek R1, GPT-OSS, RNJ-1), and OpenRouter (Auto free tier).',
      },
      {
        q: 'What is Auto mode?',
        a: "Auto mode is SOHAM's smart routing system. It analyzes your query and automatically selects the best model — math questions go to math-capable models, coding questions to DeepSeek or Llama 3.3, image tasks to Gemini, and so on. It's recommended for most users.",
      },
      {
        q: 'Which models are completely free with no limits?',
        a: 'HuggingFace models (DeepSeek R1, GPT-OSS, RNJ-1) and OpenRouter Auto free tier have no usage limits. These are marked "Free" in the model selector.',
      },
      {
        q: 'Which model is fastest?',
        a: "Groq's Llama 3.1 8B Instant is the fastest — Groq's hardware is purpose-built for ultra-low latency inference. Use it when you need quick answers and speed matters more than depth.",
      },
      {
        q: 'Which model is best for coding?',
        a: 'DeepSeek R1 (HuggingFace) is the best coding model available in SOHAM. For general programming questions, Llama 3.3 70B also performs very well. Auto mode will route coding questions to these models automatically.',
      },
      {
        q: 'Which model is best for long documents?',
        a: 'Google Gemini 2.5 Flash has the largest context window and is best for long documents, PDFs, and complex multi-step reasoning tasks.',
      },
      {
        q: 'Can I switch models mid-conversation?',
        a: 'Yes. Open the model selector in the top bar and switch at any time. The conversation history is preserved and passed to the new model.',
      },
    ],
  },
  {
    id: 'features',
    title: 'Features & Commands',
    icon: MessageSquare,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    questions: [
      {
        q: 'What are slash commands?',
        a: 'Slash commands are shortcuts that route your query to a specialized pipeline. /solve routes to math/coding models with step-by-step output. /search triggers DuckDuckGo web search. /summarize condenses long text into key points. /translate translates text. /classify categorizes content. You can also just ask naturally — SOHAM understands intent.',
      },
      {
        q: 'Does web search trigger automatically?',
        a: "Yes. SOHAM's intent detector scans every message for signals that need real-time data — keywords like \"today\", \"latest\", \"current\", \"news\", \"price\", \"who is the current...\", etc. When detected, it automatically fetches DuckDuckGo results and synthesizes them with source links.",
      },
      {
        q: 'How does voice input work?',
        a: 'Click the microphone icon next to the message input. Allow microphone access when prompted. Speak clearly — Groq Whisper V3 Turbo transcribes your speech in real time. The transcription appears in the input field for you to review before sending.',
      },
      {
        q: 'How does text-to-speech work?',
        a: 'Enable speech output in settings and choose a voice. You can also click the speaker icon on any assistant message to hear it read aloud. SOHAM uses Groq\'s Orpheus TTS with a fallback chain to Edge TTS and browser TTS.',
      },
      {
        q: 'How does image generation work?',
        a: 'Type "generate an image of..." or "create a picture of..." in chat. SOHAM routes this to the image generation pipeline using HuggingFace FLUX.1-schnell. The generated image appears inline in the chat with download and preview options.',
      },
      {
        q: 'How does PDF analysis work?',
        a: 'Go to /ai-services or /pdf-analyzer. Upload a PDF (up to 5 MB). Ask questions about the document — SOHAM extracts text, analyzes content, and answers your questions. Great for research papers, contracts, reports, and documentation.',
      },
      {
        q: 'Does SOHAM remember our conversation?',
        a: 'Yes, within a session. The AI maintains full context across all messages in a conversation. You can reference earlier messages naturally: "explain that differently" or "give me another example of what you showed earlier."',
      },
      {
        q: 'Can I export my conversations?',
        a: 'Yes. Use the export button in the chat sidebar to download conversations as JSON. You can also copy individual messages or use the share feature.',
      },
    ],
  },
  {
    id: 'technical',
    title: 'Technical Issues & Troubleshooting',
    icon: Settings,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    questions: [
      {
        q: "The AI isn't responding or is very slow",
        a: 'Try: (1) Refresh the page. (2) Check your internet connection. (3) Switch to a different model in settings — free HuggingFace models may be slower during peak times. (4) Try a Groq model for fastest response. (5) Clear browser cache if the issue persists.',
      },
      {
        q: "Voice input isn't working",
        a: 'Check that your browser has microphone permissions (click the lock icon in the address bar). Make sure your microphone works in other apps. Voice input requires HTTPS. Try Chrome or Edge for best compatibility. Disable browser extensions that might block microphone access.',
      },
      {
        q: "I can't install the mobile app",
        a: 'Android: Use Chrome, visit the site, tap the menu (⋮), and select "Add to Home screen." iOS: Use Safari only (not Chrome), tap the share button (□↑), then "Add to Home Screen." Make sure you\'re on the latest browser version.',
      },
      {
        q: "My settings aren't saving",
        a: "Settings are stored in browser local storage. Make sure cookies and local storage are enabled. Settings won't persist in private/incognito mode. Try clearing browser cache and reconfiguring.",
      },
      {
        q: 'The AI gave an incorrect answer',
        a: 'Try: (1) Rephrase with more specific details. (2) Use /solve for math/coding, /search for current info. (3) Switch to a different model manually. (4) For current events, make sure web search triggered (you\'ll see source links in the response). (5) Ask the AI to "try again" or "reconsider."',
      },
      {
        q: 'Image generation failed',
        a: 'HuggingFace free tier has rate limits. Wait a few minutes and try again. Make sure your prompt is clear and descriptive. Avoid prompts that might violate content policies. Try simplifying the prompt if it\'s very complex.',
      },
      {
        q: 'The page is loading slowly',
        a: 'SOHAM is a PWA — after the first load, it caches resources for faster subsequent loads. If it\'s consistently slow, try: clearing cache, disabling browser extensions, or switching to a faster network.',
      },
    ],
  },
  {
    id: 'mobile',
    title: 'Mobile & PWA',
    icon: Smartphone,
    color: 'text-green-500',
    bg: 'bg-green-500/10',
    questions: [
      {
        q: 'How do I install SOHAM on my phone?',
        a: 'SOHAM is a Progressive Web App (PWA). Android: Open in Chrome → menu (⋮) → "Add to Home screen." iOS: Open in Safari → share button (□↑) → "Add to Home Screen." The app will work like a native app with its own icon.',
      },
      {
        q: 'Does the installed app work offline?',
        a: 'The app shell loads offline (you can open it without internet). However, generating new AI responses requires an internet connection. Previously loaded conversations are accessible offline.',
      },
      {
        q: 'Why install instead of using the browser?',
        a: 'The installed PWA gives you: full-screen experience without browser UI, faster loading with cached resources, home screen icon for quick access, and better integration with your device\'s app switcher.',
      },
      {
        q: 'Is there a native Android or iOS app?',
        a: 'Not yet — the PWA provides a near-native experience on both platforms. A native app is on the roadmap for future development.',
      },
    ],
  },
  {
    id: 'privacy',
    title: 'Privacy & Security',
    icon: Shield,
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    questions: [
      {
        q: 'Is my data safe?',
        a: "Yes. Conversations are stored locally in your browser's local storage — not on SOHAM servers. We use HTTPS for all connections. We don't log or monitor your conversations. Your privacy is a core design principle.",
      },
      {
        q: 'Do you use my conversations to train AI models?',
        a: 'No. Your conversations are not used to train AI models and are not shared with model providers for training purposes.',
      },
      {
        q: 'Can I delete my conversation history?',
        a: "Yes. Clear conversation history anytime through the settings panel or by clearing your browser's local storage for soham-ai.vercel.app.",
      },
      {
        q: 'Is SOHAM GDPR compliant?',
        a: 'Yes. We follow GDPR principles: data minimization, user control, transparency, and no data selling. Read our full Privacy Policy for details.',
      },
      {
        q: 'What data does SOHAM collect?',
        a: 'Minimal data: anonymous usage analytics (page views, feature usage) via Google Analytics. No conversation content, no personal data without explicit consent. Account users store only email and display name for authentication.',
      },
    ],
  },
  {
    id: 'community',
    title: 'Community & Contributions',
    icon: Users,
    color: 'text-pink-500',
    bg: 'bg-pink-500/10',
    questions: [
      {
        q: 'How can I contribute to SOHAM?',
        a: 'Visit our GitHub repository to open issues, suggest features, or submit pull requests. Community feedback directly shapes the product roadmap.',
      },
      {
        q: 'Is there a community forum or discussion board?',
        a: 'Yes! Visit the /community page to share posts, ask questions, and interact with other SOHAM users. Posts are stored publicly and help build a knowledge base for everyone.',
      },
      {
        q: 'How can I report a bug?',
        a: 'Use the contact form at /contact, email us directly, or open a GitHub issue. Include: what you were doing, what happened, what you expected, your browser and OS, and any error messages.',
      },
      {
        q: 'Can I suggest new AI models to add?',
        a: 'Absolutely. Use the contact form or GitHub issues to suggest models. We evaluate new models based on quality, availability, cost, and user demand.',
      },
    ],
  },
];

export default function FAQPage() {
  const totalQuestions = sections.reduce((sum, s) => sum + s.questions.length, 0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageHeader backLink="/" backText="Back to Home" title="FAQ" />

      {/* JSON-LD: FAQPage structured data for Google rich results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            name: 'SOHAM FAQ — Frequently Asked Questions',
            url: 'https://soham-ai.vercel.app/faq',
            description: 'Answers to the most common questions about SOHAM by CODEEX-AI.',
            mainEntity: sections.flatMap((s) =>
              s.questions.map((faq) => ({
                '@type': 'Question',
                name: faq.q,
                acceptedAnswer: { '@type': 'Answer', text: faq.a },
              }))
            ),
          }),
        }}
      />

      {/* Breadcrumb JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://soham-ai.vercel.app' },
              { '@type': 'ListItem', position: 2, name: 'FAQ', item: 'https://soham-ai.vercel.app/faq' },
            ],
          }),
        }}
      />

      <main className="container mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-12 space-y-10">

        {/* ── Hero ── */}
        <section className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border bg-muted px-4 py-2 text-sm">
            <HelpCircle className="h-4 w-4 text-primary" />
            <span className="font-medium">Frequently Asked Questions</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Everything you need to know about{' '}
            <span className="text-primary">SOHAM</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            {totalQuestions} answers across {sections.length} categories — from getting started to advanced
            troubleshooting. Can&apos;t find what you need?{' '}
            <Link href="/contact" className="text-primary hover:underline font-medium">
              Contact us
            </Link>
            .
          </p>
        </section>

        {/* ── Quick nav ── */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Search className="h-4 w-4 text-primary" />
              Jump to a Section
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {sections.map((s) => (
                <a key={s.id} href={`#${s.id}`} className="group block">
                  <div className="flex items-center gap-2.5 rounded-xl bg-background/60 p-3 transition-all hover:bg-background hover:border-primary/30 border border-transparent">
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${s.bg}`}>
                      <s.icon className={`h-3.5 w-3.5 ${s.color}`} />
                    </div>
                    <div>
                      <span className="text-xs font-medium group-hover:text-primary transition-colors">{s.title}</span>
                      <p className="text-[10px] text-muted-foreground">{s.questions.length} questions</p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ── Stats bar ── */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Total Questions', value: String(totalQuestions), icon: HelpCircle },
            { label: 'AI Models', value: '35+', icon: Cpu },
            { label: 'Features Covered', value: '20+', icon: Zap },
            { label: 'Always Free', value: '100%', icon: Star },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border bg-card p-4 text-center">
              <stat.icon className="h-4 w-4 text-primary mx-auto mb-1.5" />
              <p className="text-xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ── FAQ Sections ── */}
        {sections.map((section) => (
          <section key={section.id} id={section.id} className="scroll-mt-20 space-y-4">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${section.bg}`}>
                <section.icon className={`h-5 w-5 ${section.color}`} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{section.title}</h2>
                <p className="text-xs text-muted-foreground">{section.questions.length} questions</p>
              </div>
            </div>
            <Card>
              <CardContent className="p-0">
                <Accordion type="single" collapsible className="w-full">
                  {section.questions.map((faq, i) => (
                    <AccordionItem
                      key={i}
                      value={`${section.id}-${i}`}
                      className="px-6 last:border-0"
                    >
                      <AccordionTrigger className="text-left text-sm font-medium hover:text-primary transition-colors py-4">
                        {faq.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </section>
        ))}

        {/* ── Feature quick links ── */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Explore SOHAM Features</h2>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {[
              { icon: MessageSquare, label: 'AI Chat', desc: '35+ models, auto-routing', href: '/chat' },
              { icon: FileText, label: 'PDF Analyzer', desc: 'Upload & ask questions', href: '/pdf-analyzer' },
              { icon: ImageIcon, label: 'Image Solver', desc: 'Solve math from photos', href: '/visual-math' },
              { icon: Mic, label: 'Voice Input', desc: 'Speak to SOHAM', href: '/chat' },
              { icon: Globe, label: 'Web Search', desc: 'Real-time search results', href: '/chat' },
              { icon: Code2, label: 'Code Assistant', desc: 'Debug & write code', href: '/chat' },
            ].map((f) => (
              <Link key={f.label} href={f.href} className="group block">
                <div className="flex items-center gap-3 rounded-xl border bg-card p-4 transition-all hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-sm">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <f.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold group-hover:text-primary transition-colors">{f.label}</p>
                    <p className="text-xs text-muted-foreground">{f.desc}</p>
                  </div>
                  <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Still need help ── */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle>Still Need Help?</CardTitle>
            <CardDescription>
              Can&apos;t find the answer? We respond to every message.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  Contact Support
                </h4>
                <p className="text-xs text-muted-foreground">Send a detailed message about your issue.</p>
                <Link href="/contact">
                  <Button variant="outline" size="sm" className="gap-2">
                    Contact Us
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  Documentation
                </h4>
                <p className="text-xs text-muted-foreground">Browse all guides and tutorials.</p>
                <Link href="/documentation">
                  <Button variant="outline" size="sm" className="gap-2">
                    Browse Docs
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Community
                </h4>
                <p className="text-xs text-muted-foreground">Ask other SOHAM users for help.</p>
                <Link href="/community">
                  <Button variant="outline" size="sm" className="gap-2">
                    Join Community
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

      </main>
    </div>
  );
}

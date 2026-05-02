/**
 * SEO Configuration for SOHAM
 * Centralized SEO settings and structured data
 * Enhanced with comprehensive developer information and high-level optimization
 */

import { DEVELOPER_INFO } from './developer-info';

export interface SEOConfig {
  title: string | { default: string; template: string };
  description: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  locale?: string;
  alternateLocales?: string[];
}

export const defaultSEO: SEOConfig = {
  title: {
    default: 'SOHAM — Free AI Platform with 35+ Models | Groq, Gemini, Cerebras, DeepSeek',
    template: '%s | SOHAM'
  },
  description:
    'SOHAM is a free AI platform with 35+ models from Groq, Cerebras, Google Gemini, HuggingFace, and OpenRouter. Free image generation, real-time web search, voice input/output, PDF analysis, and 13 specialized AI skills. Built by Heoster at CODEEX-AI.',
  keywords: [
    // Core Brand
    'SOHAM', 'SOHAM AI', 'SOHAM by CODEEX-AI', 'CODEEX-AI', 'Heoster',
    'Soham meaning', 'Soham Sanskrit meaning', 'So Hum mantra',
    // Free AI
    'free ai chat', 'free ai platform', 'free chatgpt alternative',
    'free ai no signup', 'ai chat free', 'free ai models',
    // Models
    'groq llama', 'google gemini 2.5', 'cerebras qwen 3 235b',
    'deepseek r1 free', 'llama 3.3 70b free', 'qwen 3 235b free',
    'gemini 2.5 flash free', '35 ai models', 'multi model ai',
    // Features
    'free image generation ai', 'ai image generator free',
    'ai voice chat free', 'pdf analyzer ai free',
    'ai web search', 'ai coding assistant free',
    'math solver ai', 'ai translation free',
    // Comparisons
    'chatgpt alternative free', 'claude alternative free',
    'better than chatgpt free', 'chatgpt plus alternative',
    // Developer
    'Heoster' ,'16 year old developer india',
    'indian ai platform', 'ai for students free',
  ],
  ogImage: 'https://soham-ai.vercel.app/Multi-Chat.png',
  ogType: 'website',
  twitterCard: 'summary_large_image',
  author: `${DEVELOPER_INFO.name} (${DEVELOPER_INFO.realName})`,
  locale: 'en_US',
  alternateLocales: [],
};

// Page-specific SEO configurations
export const pageSEO = {
  home: {
    title: 'SOHAM — Free AI with 35+ Models | Groq, Gemini, Cerebras, DeepSeek — No Signup',
    description:
      'SOHAM is a free AI platform with 35+ models from Groq, Cerebras, Gemini, HuggingFace, and OpenRouter. Free image generation, real-time web search, voice input/output, PDF analysis, and 13 AI skills. Better than ChatGPT Plus — at $0.',
    keywords: [
      'SOHAM', 'free ai platform', 'free chatgpt alternative', 'CODEEX-AI', 'Heoster',
      '35 ai models free', 'groq gemini cerebras free', 'free image generation ai',
      'ai voice chat free', 'pdf analyzer free', 'ai web search free', 'SOHAM AI', 'SOHAM by CODEEX-AI', 'CODEEX-AI', 'Heoster',
    ],
  },
  chat: {
    title: 'AI Chat — 35+ Models Free | SOHAM by CODEEX-AI',
    description:
      'Chat with 35+ AI models for free: Groq Llama 4, Cerebras Qwen 3 235B, Gemini 2.5 Pro, DeepSeek R1, NVIDIA Nemotron 120B. Auto-routing picks the best model. No signup required.',
    keywords: [
      'ai chat free', 'SOHAM chat', '35 ai models', 'groq llama free',
      'cerebras qwen 3 235b', 'gemini 2.5 free', 'deepseek r1 free',
      'free chatgpt alternative', 'ai chat no signup','SOHAM', 'SOHAM AI', 'SOHAM by CODEEX-AI', 'CODEEX-AI', 'Heoster',
    ],
  },
  features: {
    title: 'Features — 35+ Models, Image Gen, Voice, PDF, Web Search | SOHAM',
    description:
      'SOHAM features: 35+ AI models, free image generation (FLUX), voice input/output (Groq Whisper + Orpheus TTS), PDF analysis, real-time web search, and 13 specialized AI skills. All free.',
    keywords: [
      'SOHAM features', 'free ai features', 'free image generation',
      'ai voice free', 'pdf analyzer ai', 'ai web search', 'ai skills free','SOHAM', 'SOHAM AI', 'SOHAM by CODEEX-AI', 'CODEEX-AI', 'Heoster',
    ],
  },
  documentation: {
    title: 'Documentation — How to Use SOHAM | 35+ Models, Commands, API',
    description:
      'SOHAM documentation: how to use 35+ AI models, slash commands (/solve /search /translate), image generation, voice features, PDF analysis, web search, and the full API reference.',
    keywords: [
      'SOHAM documentation', 'SOHAM guide', 'SOHAM commands', 'SOHAM API',
      'how to use SOHAM', 'ai slash commands', 'SOHAM tutorial','SOHAM', 'SOHAM AI', 'SOHAM by CODEEX-AI', 'CODEEX-AI', 'Heoster',
    ],
  },
  about: {
    title: `About Heoster — 16-Year-Old Founder of CODEEX-AI & Creator of SOHAM`,
    description: `Meet Heoster (Harsh), 16-year-old founder of CODEEX-AI and creator of SOHAM from Khatauli, India. Built 35+ AI models into one free platform at age 16. 50,000+ lines of code, 100+ countries reached.`,
    keywords: [
      'Heoster', 'founder of CODEEX-AI', 'creator of SOHAM',
      '16 year old developer india', 'indian ai startup founder',
      'CODEEX-AI founder', 'Harsh developer','SOHAM', 'SOHAM AI', 'SOHAM by CODEEX-AI', 'CODEEX-AI', 'Heoster',
    ],
  },
  contact: {
    title: 'Contact SOHAM | Get Support, Report Bugs, Partner with CODEEX-AI',
    description: `Contact the SOHAM team. Email: ${DEVELOPER_INFO.contact.email}. GitHub, LinkedIn, Twitter available. Based in Khatauli, India. Response within 24 hours.`,
    keywords: [
      'SOHAM contact', 'CODEEX-AI contact', 'Heoster contact','SOHAM', 'SOHAM AI', 'SOHAM by CODEEX-AI', 'CODEEX-AI', 'Heoster',
      'SOHAM support', 'bug report SOHAM', 'feature request SOHAM',
    ],
  },
  faq: {
    title: 'FAQ — Frequently Asked Questions | SOHAM by CODEEX-AI',
    description:
      'Answers to the most common SOHAM questions: Is it free? How many models? How does image generation work? How to install on phone? Privacy policy? Voice features?',
    keywords: [
      'SOHAM FAQ', 'SOHAM questions', 'is SOHAM free', 'SOHAM models','SOHAM', 'SOHAM AI', 'SOHAM by CODEEX-AI', 'CODEEX-AI', 'Heoster',
      'SOHAM image generation', 'SOHAM voice', 'SOHAM privacy','SOHAM', 'SOHAM AI', 'SOHAM by CODEEX-AI', 'CODEEX-AI', 'Heoster',
    ],
  },
  community: {
    title: 'Community — Share Tips, Ask Questions, Connect | SOHAM',
    description:
      'Join the SOHAM community. Share AI tips, ask questions, post experiments, and connect with other users. Powered by Supabase. Open to everyone.',
    keywords: [
      'SOHAM community', 'AI community forum', 'SOHAM users','SOHAM', 'SOHAM AI', 'SOHAM by CODEEX-AI', 'CODEEX-AI', 'Heoster',
      'share AI tips', 'AI discussion board',
    ],
  },
  privacy: {
    title: 'Privacy Policy — No Data Selling, Local Storage | SOHAM',
    description:
      'SOHAM privacy policy: conversations stored locally in your browser, no data selling, no training on your chats, GDPR compliant, open source MIT License.',
    keywords: [
      'SOHAM privacy', 'ai privacy policy', 'no data selling ai',
      'GDPR compliant ai', 'local storage ai chat','SOHAM', 'SOHAM AI', 'SOHAM by CODEEX-AI', 'CODEEX-AI', 'Heoster',
    ],
  },
  terms: {
    title: 'Terms of Service | SOHAM by CODEEX-AI',
    description: 'SOHAM Terms of Service. Free forever commitment, acceptable use policy, user rights, and platform rules.',
    keywords: ['SOHAM terms', 'terms of service ai', 'SOHAM usage policy', 'SOHAM AI', 'SOHAM by CODEEX-AI', 'CODEEX-AI', 'Heoster'
    ],
  },
  models: {
    title: '35+ AI Models Free — Groq, Gemini 2.5, Cerebras Qwen 3 235B, DeepSeek R1 | SOHAM',
    description:
      'All 35+ SOHAM AI models: Groq (Llama 4 Scout, GPT-OSS 120B), Cerebras (Qwen 3 235B, GLM 4.7), Google (Gemini 2.5 Pro/Flash), HuggingFace (DeepSeek R1, Llama 3.3 70B), OpenRouter (NVIDIA Nemotron 120B, Arcee Trinity 400B). All free.',
    keywords: [
      'SOHAM models', 'free ai models', 'groq models free', 'gemini 2.5 free',
      'cerebras qwen 3 235b free', 'deepseek r1 free', 'llama 3.3 70b free',
      'nvidia nemotron free', '35 ai models one platform','SOHAM', 'SOHAM AI', 'SOHAM by CODEEX-AI', 'CODEEX-AI', 'Heoster',
    ],
  },
};

// Structured data for rich snippets
export const structuredData = {
  organization: {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://soham-ai.vercel.app/#organization',
    name: 'CODEEX-AI',
    alternateName: ['SOHAM', 'CodeEx-AI', 'Codeex AI'],
    url: 'https://soham-ai.vercel.app',
    logo: 'https://soham-ai.vercel.app/FINALSOHAM.png',
    description: `CODEEX-AI is the company behind SOHAM, a human-centered AI platform with 35+ models for coding, math solving, PDF analysis, voice workflows, and adaptive task support.`,
    foundingDate: DEVELOPER_INFO.company.founded,
    foundingLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: DEVELOPER_INFO.location.city,
        addressRegion: DEVELOPER_INFO.location.state,
        addressCountry: DEVELOPER_INFO.location.country,
      },
    },
    founder: {
      '@type': 'Person',
      name: DEVELOPER_INFO.name,
      alternateName: DEVELOPER_INFO.realName,
      age: DEVELOPER_INFO.age,
      jobTitle: DEVELOPER_INFO.company.role,
      description: `${DEVELOPER_INFO.age}-year-old visionary developer and founder of ${DEVELOPER_INFO.company.name}. ${DEVELOPER_INFO.education.class} student at ${DEVELOPER_INFO.education.school}.`,
      address: {
        '@type': 'PostalAddress',
        addressLocality: DEVELOPER_INFO.location.city,
        addressRegion: DEVELOPER_INFO.location.state,
        addressCountry: DEVELOPER_INFO.location.country,
      },
      email: DEVELOPER_INFO.contact.email,
      alumniOf: {
        '@type': 'EducationalOrganization',
        name: DEVELOPER_INFO.education.school,
      },
      knowsAbout: DEVELOPER_INFO.skills,
      sameAs: [
        DEVELOPER_INFO.contact.github,
        DEVELOPER_INFO.contact.linkedin,
        DEVELOPER_INFO.contact.twitter,
      ],
    },
    contactPoint: {
      '@type': 'ContactPoint',
      email: DEVELOPER_INFO.contact.email,
      contactType: 'Customer Support',
      availableLanguage: ['English', 'Hindi'],
    },
    sameAs: [
      DEVELOPER_INFO.contact.github,
      DEVELOPER_INFO.contact.linkedin,
      DEVELOPER_INFO.contact.twitter,
    ],
    slogan: DEVELOPER_INFO.vision,
    numberOfEmployees: {
      '@type': 'QuantitativeValue',
      value: 1,
    },
  },
  person: {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': 'https://soham-ai.vercel.app/#person',
    name: DEVELOPER_INFO.name,
    alternateName: DEVELOPER_INFO.realName,
    givenName: DEVELOPER_INFO.realName,
    additionalName: DEVELOPER_INFO.alias,
    age: DEVELOPER_INFO.age,
    gender: 'Male',
    birthPlace: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: DEVELOPER_INFO.location.city,
        addressRegion: DEVELOPER_INFO.location.state,
        addressCountry: DEVELOPER_INFO.location.country,
      },
    },
    homeLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: DEVELOPER_INFO.location.city,
        addressRegion: DEVELOPER_INFO.location.state,
        addressCountry: DEVELOPER_INFO.location.country,
      },
    },
    jobTitle: DEVELOPER_INFO.company.role,
    worksFor: {
      '@type': 'Organization',
      name: DEVELOPER_INFO.company.name,
    },
    alumniOf: {
      '@type': 'EducationalOrganization',
      name: DEVELOPER_INFO.education.school,
    },
    email: DEVELOPER_INFO.contact.email,
    url: 'https://soham-ai.vercel.app',
    image: 'https://soham-ai.vercel.app/FINALSOHAM.png',
    description: `${DEVELOPER_INFO.name} is a ${DEVELOPER_INFO.age}-year-old founder-builder and the developer behind SOHAM. Currently studying ${DEVELOPER_INFO.education.class} ${DEVELOPER_INFO.education.stream} at ${DEVELOPER_INFO.education.school}, he is building a human-centered AI platform inspired by the Sanskrit meaning of Soham: "I am That."`,
    knowsAbout: DEVELOPER_INFO.skills.concat(DEVELOPER_INFO.aiTechnologies),
    knowsLanguage: ['English', 'Hindi'],
    hasCredential: DEVELOPER_INFO.achievements.map(achievement => ({
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: 'Achievement',
      description: achievement,
    })),
    sameAs: [
      DEVELOPER_INFO.contact.github,
      DEVELOPER_INFO.contact.linkedin,
      DEVELOPER_INFO.contact.twitter,
      `https://instagram.com/${DEVELOPER_INFO.social.instagram}`,
    ],
  },
  softwareApplication: {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'SOHAM',
    alternateName: ['SOHAM by CODEEX-AI', 'CODEEX-AI SOHAM'],
    applicationCategory: 'ProductivityApplication',
    applicationSubCategory: 'Artificial Intelligence Platform',
    operatingSystem: 'Web Browser, iOS, Android, Windows, macOS, Linux',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      priceValidUntil: '2099-12-31',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: DEVELOPER_INFO.projectStats.dailyUsers.replace('+', ''),
      bestRating: '5',
      worstRating: '1',
      reviewCount: '500',
    },
    description: `SOHAM is a free AI platform from CODEEX-AI with 35+ models from Groq, Cerebras, Google Gemini, HuggingFace, and OpenRouter. Features include free image generation (FLUX), real-time web search, voice input/output (Groq Whisper + Orpheus TTS), PDF analysis, and 13 specialized AI skills. Built by Heoster, age 16, from Khatauli, India.`,
    keywords: 'SOHAM, free AI, 35 AI models, Groq, Gemini, Cerebras, DeepSeek, HuggingFace, OpenRouter, free image generation, voice AI, PDF analyzer, web search AI, CODEEX-AI, Heoster, chatgpt alternative free',
    featureList: [
      '35+ AI models from Groq, Cerebras, Google, HuggingFace, OpenRouter',
      'Groq: Llama 4 Scout 17B, GPT-OSS 120B, Qwen3 32B, Llama 3.1 8B Instant',
      'Cerebras: Qwen 3 235B, GPT-OSS 120B, GLM 4.7, Llama 3.1 8B',
      'Google: Gemini 2.5 Pro, Gemini 2.5 Flash (1M context), Imagen 3, Veo 2',
      'HuggingFace: DeepSeek R1 70B, Llama 3.3 70B, Qwen 2.5 72B',
      'OpenRouter: NVIDIA Nemotron 120B, Arcee Trinity 400B, MiniMax M2.5',
      'Smart auto-routing — intent detector picks best model per query',
      'Free image generation — Pollinations.ai FLUX + Cloudflare + HuggingFace fallback',
      'Voice input — Groq Whisper V3 Turbo speech-to-text',
      'Voice output — Groq Orpheus TTS, 6 voices, vocal direction tags',
      'Real-time web search — DuckDuckGo + GNews + Open-Meteo + CricAPI + CoinGecko',
      'PDF analysis — up to 5MB, Gemini 2.5 Flash, Q&A + summary',
      'Image math solver — photo of equation → step-by-step solution',
      '13 specialized skills: translation, grammar, quiz, recipe, sentiment, fact-check, dictionary, classify',
      '16 slash commands: /solve /summarize /search /news /weather /translate /grammar /quiz /recipe /joke /define /factcheck',
      'Mobile PWA — installable on Android, iOS, Windows, Mac',
      'Offline support via service worker',
      'Privacy-first — local storage, no data selling, no training on chats',
      'Open source MIT License',
      '100% free forever — no credit card, no subscription',
      'No signup required for basic use',
      'GDPR compliant',
      '99.9% uptime, 100+ countries, Lighthouse 95+',
    ],
    author: {
      '@type': 'Person',
      name: DEVELOPER_INFO.name,
      age: DEVELOPER_INFO.age,
    },
    creator: {
      '@type': 'Person',
      name: DEVELOPER_INFO.name,
      age: DEVELOPER_INFO.age,
    },
    publisher: {
      '@type': 'Organization',
      name: 'CODEEX-AI',
      url: 'https://soham-ai.vercel.app',
    },
    brand: {
      '@type': 'Brand',
      name: 'SOHAM',
      slogan: 'Self Organising Hyper Adaptive Machine',
    },
    datePublished: '2024-01-01',
    dateModified: new Date().toISOString().split('T')[0],
    inLanguage: ['en', 'hi'],
    screenshot: 'https://soham-ai.vercel.app/Multi-Chat.png',
    softwareVersion: DEVELOPER_INFO.projectStats.modelsIntegrated.toString(),
    releaseNotes: `Latest update includes ${DEVELOPER_INFO.projectStats.modelsIntegrated}+ AI models with enhanced performance and new features.`,
  },
  website: {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': 'https://soham-ai.vercel.app/#website',
    name: 'SOHAM',
    alternateName: ['SOHAM by CODEEX-AI', 'CODEEX-AI SOHAM'],
    url: 'https://soham-ai.vercel.app',
    description: `SOHAM is the AI product from CODEEX-AI for chat, coding help, PDF analysis, image math solving, and voice workflows. The brand is inspired by the Sanskrit mantra Soham, meaning "I am That."`,
    publisher: {
      '@type': 'Organization',
      name: 'CODEEX-AI',
      url: 'https://soham-ai.vercel.app',
    },
    inLanguage: ['en', 'hi'],
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://soham-ai.vercel.app/chat?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
    creator: {
      '@type': 'Person',
      name: DEVELOPER_INFO.name,
      age: DEVELOPER_INFO.age,
    },
  },
  faq: {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What does SOHAM mean?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `SOHAM has two connected meanings. In the product, it stands for "${DEVELOPER_INFO.product.expandedName}". The name is also inspired by the Sanskrit mantra Soham (So Hum), meaning "${DEVELOPER_INFO.product.sanskritMeaning}". In spiritual philosophy, it points to the unity of the individual self with universal consciousness and is often used in meditation with breath awareness.`,
        },
      },
      {
        '@type': 'Question',
        name: 'Who created SOHAM?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `SOHAM was created by ${DEVELOPER_INFO.name} (also known as ${DEVELOPER_INFO.realName}), a ${DEVELOPER_INFO.age}-year-old founder-builder from ${DEVELOPER_INFO.location.city}, ${DEVELOPER_INFO.location.state}, India. He is currently studying ${DEVELOPER_INFO.education.class} ${DEVELOPER_INFO.education.stream} at ${DEVELOPER_INFO.education.school}. He founded ${DEVELOPER_INFO.company.name} in ${DEVELOPER_INFO.company.founded} to build more accessible, human-centered AI tools.`,
        },
      },
      {
        '@type': 'Question',
        name: 'Is SOHAM free to use?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Yes! SOHAM is completely free to use forever. We provide access to 35+ AI models at no cost, making advanced AI technology accessible to everyone. ${DEVELOPER_INFO.name}'s mission is: "${DEVELOPER_INFO.mission}"`,
        },
      },
      {
        '@type': 'Question',
        name: 'What AI models does SOHAM support?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'SOHAM supports 35+ AI models including Groq (Llama 3.1 8B, Llama 3.3 70B, Mixtral 8x7B, Gemma 2 9B), Google Gemini 2.5, Cerebras (Qwen 3 235B Instruct, Qwen 3 32B, GLM 4.7), Hugging Face (DeepSeek R1, GPT-OSS, RNJ-1), and more. You can switch between models or use smart auto-routing.',
        },
      },
      {
        '@type': 'Question',
        name: 'How can I contact the developer?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `You can contact ${DEVELOPER_INFO.name} at ${DEVELOPER_INFO.contact.email}, or connect on LinkedIn (${DEVELOPER_INFO.social.linkedin}), GitHub (@${DEVELOPER_INFO.social.github}), Twitter (@${DEVELOPER_INFO.social.Twitter}), or Instagram (@${DEVELOPER_INFO.social.instagram}).`,
        },
      },
      {
        '@type': 'Question',
        name: 'What makes SOHAM unique?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `SOHAM is unique because it's built by a ${DEVELOPER_INFO.age}-year-old student developer who has integrated 35+ AI models into one platform. It features ${DEVELOPER_INFO.projectStats.linesOfCode} lines of code, ${DEVELOPER_INFO.projectStats.components} components, ${DEVELOPER_INFO.projectStats.uptime} uptime, and reaches ${DEVELOPER_INFO.projectStats.countriesReached} countries with ${DEVELOPER_INFO.projectStats.dailyUsers} daily users. It's completely free, privacy-first, and built with the vision to democratize AI education. Tested by a team of friends including Vidhan, Avineet, Vansh, Aayush, Varun, Pankaj, Masum, Sachin, Pardhuman, Shivansh, Vaibhav, Kartik, and Harsh.`,
        },
      },
      {
        '@type': 'Question',
        name: 'What features does SOHAM offer?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'SOHAM offers: 35+ AI models, real-time chat with streaming, code assistance and debugging, math problem solving with steps, PDF analysis (5MB), web search with citations, voice synthesis (Edge TTS), image equation solver, smart notes, smart auto-routing, mobile PWA, offline support, share & export (TXT, MD, PDF), and more. All features are 100% free.',
        },
      },
    ],
  },
  breadcrumb: {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://soham-ai.vercel.app',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Chat',
        item: 'https://soham-ai.vercel.app/chat',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Features',
        item: 'https://soham-ai.vercel.app/features',
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: 'Documentation',
        item: 'https://soham-ai.vercel.app/documentation',
      },
      {
        '@type': 'ListItem',
        position: 5,
        name: 'About',
        item: 'https://soham-ai.vercel.app/about',
      },
      {
        '@type': 'ListItem',
        position: 6,
        name: 'FAQ',
        item: 'https://soham-ai.vercel.app/faq',
      },
      {
        '@type': 'ListItem',
        position: 7,
        name: 'Community',
        item: 'https://soham-ai.vercel.app/community',
      },
      {
        '@type': 'ListItem',
        position: 8,
        name: 'Contact',
        item: 'https://soham-ai.vercel.app/contact',
      },
    ],
  },
};

// Analytics tracking helper
export function trackPageView(pathname: string, title?: string) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('config', 'G-YH87NZPSKB', {
      page_path: pathname,
      page_title: title,
    });
  }
}

// Track custom events
export function trackEvent(eventName: string, eventParams?: Record<string, any>) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, eventParams);
  }
}

import type {IntentType} from './intent-detector';

const currentAffairsSubjects = [
  'the current vice president of India',
  'the current prime minister of the UK',
  'today’s bitcoin price',
  'the latest Nvidia stock price',
  'today’s weather in Mumbai',
  'the current CEO of OpenAI',
  'the latest IPL points table',
  'today’s gold rate in India',
  'the latest AI regulations in Europe',
  'the current population of Japan',
  'the latest iPhone launch news',
  'today’s USD to INR exchange rate',
  'the latest SpaceX launch schedule',
  'today’s cricket score',
  'the current governor of RBI',
  'the latest Tesla earnings report',
  'today’s top tech headlines',
  'the current president of Mexico',
  'the latest unemployment rate in India',
  'the current market cap of Microsoft',
];

const explanationSubjects = [
  'closures in JavaScript',
  'how neural networks work',
  'event bubbling in React',
  'the difference between SQL and NoSQL',
  'recursion in programming',
  'the blockchain consensus process',
  'dependency injection',
  'how APIs work',
  'the concept of inflation',
  'asynchronous programming',
  'REST vs GraphQL',
  'memoization',
  'how DNS resolution works',
  'object-oriented programming',
  'binary search',
  'garbage collection',
  'TCP vs UDP',
  'the CAP theorem',
  'JWT authentication',
  'vector databases',
];

const codeTasks = [
  'a React pricing card component',
  'a Python function to reverse a linked list',
  'an Express middleware for request logging',
  'a TypeScript debounce utility',
  'a responsive navbar in Tailwind CSS',
  'a Node.js script to parse CSV files',
  'a REST API endpoint for user signup',
  'a Next.js contact form',
  'a Java class for a simple calculator',
  'a Rust function for factorial',
  'a SQL query for monthly revenue',
  'a Firebase auth hook',
  'a Go HTTP server example',
  'a JWT verification helper',
  'a dark mode toggle component',
  'a reusable modal component',
  'a Python Flask upload route',
  'a React chat message component',
  'a TypeScript type-safe event emitter',
  'a cron job script for backups',
];

const imageScenes = [
  'a futuristic eco-friendly city',
  'a cyberpunk street in rain',
  'a realistic lion in the savannah',
  'an anime girl reading in a library',
  'a watercolor mountain sunset',
  'a product mockup of wireless earbuds',
  'a fantasy castle above clouds',
  'a minimal poster of the moon',
  'a sketch of a vintage car',
  'a 3D render of a smart home',
  'a sci-fi astronaut on Mars',
  'a cozy cafe in winter',
  'a cinematic desert road',
  'a botanical illustration of a rose',
  'a futuristic robot teacher',
  'a floating island with waterfalls',
  'a realistic portrait of an old sailor',
  'a neon-lit gaming room',
  'a concept art dragon flying over a city',
  'a clay-style cupcake mascot',
];

const chatSubjects = [
  'I had a long day at work',
  'I want to build better study habits',
  'I am feeling stuck on my project',
  'I need help planning my week',
  'I want to become more confident',
  'I’m trying to improve communication skills',
  'I want to learn something new this month',
  'I feel distracted while working',
  'I need motivation to finish my tasks',
  'I want a better morning routine',
  'I’m unsure what career path suits me',
  'I want help organizing my thoughts',
  'I need advice on managing stress',
  'I want a quick productivity reset',
  'I’m struggling to stay consistent',
  'I want ideas for self-improvement',
  'I need a simple action plan for today',
  'I want to focus better while studying',
  'I want to stop procrastinating',
  'I need a calm conversation right now',
];

function buildExamples(subjects: string[], templates: string[]): string[] {
  return templates.flatMap(template => subjects.map(subject => template.replace('{subject}', subject)));
}

export const INTENT_TRAINING_DATA: Record<IntentType, string[]> = {
  WEB_SEARCH: buildExamples(currentAffairsSubjects, [
    'Search {subject}.',
    'Find {subject}.',
    'Who is {subject}?',
    'What is {subject}?',
  ]),
  IMAGE_GENERATION: buildExamples(imageScenes, [
    'Generate an image of {subject}.',
    'Create a picture of {subject}.',
    'Draw {subject}.',
    'Make a realistic illustration of {subject}.',
  ]),
  CHAT: buildExamples(chatSubjects, [
    '{subject}.',
    'Can we talk about this: {subject}?',
    'I need advice because {subject}.',
    'Help me think through this: {subject}.',
  ]),
  CODE_GENERATION: buildExamples(codeTasks, [
    'Write code for {subject}.',
    'Create {subject}.',
    'Build {subject}.',
    'Generate {subject}.',
  ]),
  EXPLANATION: buildExamples(explanationSubjects, [
    'Explain {subject}.',
    'Teach me {subject}.',
    'Help me understand {subject}.',
    'What is {subject}?',
  ]),
};

export const SEARCH_VS_SOLVE_DISAMBIGUATION = [
  { intent: 'WEB_SEARCH' as const, query: 'Search who is the current vice president of India.' },
  { intent: 'WEB_SEARCH' as const, query: 'Find today’s gold rate in India.' },
  { intent: 'WEB_SEARCH' as const, query: 'Who is the current governor of RBI?' },
  { intent: 'WEB_SEARCH' as const, query: 'What is the latest Nvidia stock price?' },
  { intent: 'EXPLANATION' as const, query: 'Explain who the vice president of India is and what the role does.' },
  { intent: 'EXPLANATION' as const, query: 'Explain how stock prices are calculated.' },
  { intent: 'CODE_GENERATION' as const, query: 'Write code to scrape the current vice president of India from a webpage.' },
  { intent: 'CHAT' as const, query: 'I was discussing the current vice president of India with a friend.' },
];

export function getTrainingExampleCount(intent: IntentType): number {
  return INTENT_TRAINING_DATA[intent]?.length ?? 0;
}

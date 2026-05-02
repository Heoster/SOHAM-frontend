'use client';

import {Sparkles} from 'lucide-react';
import {useEffect, useState} from 'react';

interface ExamplePromptsProps {
  onSendMessage: (message: string) => void;
}

const prompts = [
  'Search who is the current vice president of India.',
  'Summarize the latest AI trends in 5 bullet points.',
  'Solve 2x^2 + 3x - 5 = 0 step by step.',
  'Generate an image of a futuristic eco-friendly city.',
  'Explain closures in JavaScript with a simple example.',
  'Find the current BTC price and today’s market sentiment.',
  'Write a React component for a responsive pricing card.',
  'Compare Next.js app router vs pages router.',
  'Draft a professional email to request a salary increase.',
  'Explain the theory of relativity to a 10-year-old.',
  'Create a 7-day keto meal plan with shopping list.',
  'How do I implement authentication in Next.js 14?',
  'What are the best practices for SEO in 2026?',
  'Write a short story about a time-traveling librarian.',
  'Translate "Where is the nearest train station?" into Japanese.',
  'Give me a list of 10 low-carb snack ideas.',
  'How does a blockchain work in simple terms?',
  'Create a workout routine for building muscle at home.',
  'What are the main differences between Python and Java?',
  'Write a CSS animation for a glowing button.',
  'How do I fix a "hydration failed" error in Next.js?',
  'List 5 productive morning habits for entrepreneurs.',
  'Explain the benefits of mindfulness meditation.',
  'What is the capital of Uzbekistan?',
  'Write a SQL query to find the second highest salary.',
  'How do I center a div using CSS Flexbox?',
  'Tell me a joke about computer programmers.',
  'What are the top-rated sci-fi movies on Netflix right now?',
  'How can I improve my public speaking skills?',
  'Describe the process of photosynthesis.',
  'Create a basic HTML template for a landing page.',
  'What is the best way to learn Data Science?',
  'Give me some tips for traveling on a budget in Europe.',
  'Write a poem about the sound of rain on a tin roof.',
  'How do I use Git to revert to a previous commit?',
  'What are the key features of TypeScript 5.0?',
  'Explain the concept of "Clean Architecture".',
  'How do I optimize a website for mobile devices?',
  'List 3 healthy alternatives to sugar.',
  'Who wrote the novel "1984"?',
];

// Duplicate for infinite marquee effect
const marqueePrompts = [...prompts, ...prompts, ...prompts];

export function ExamplePrompts({onSendMessage}: ExamplePromptsProps) {
  return (
    <div className="mx-auto w-full max-w-5xl px-3 pb-3 md:px-4">
      <div className="chat-prompt-strip rounded-2xl border border-border/70 bg-background/80 p-2 shadow-sm backdrop-blur">
        <div className="mb-2 flex items-center gap-2 px-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Quick Suggestions</span>
        </div>
        <div className="chat-prompt-marquee overflow-hidden">
          <div className="chat-prompt-track-ltr">
            {marqueePrompts.map((prompt, index) => (
              <button
                key={`${prompt}-${index}`}
                type="button"
                onClick={() => onSendMessage(prompt)}
                className="chat-prompt-chip"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import {Sparkles} from 'lucide-react';

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
];

const marqueePrompts = [...prompts, ...prompts];

export function ExamplePrompts({onSendMessage}: ExamplePromptsProps) {
  return (
    <div className="mx-auto w-full max-w-5xl px-3 pb-3 md:px-4">
      <div className="chat-prompt-strip rounded-2xl border border-border/70 bg-background/80 p-2 shadow-sm backdrop-blur">
        <div className="mb-2 flex items-center gap-2 px-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Try a Prompt</span>
        </div>
        <div className="chat-prompt-marquee">
          <div className="chat-prompt-track">
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

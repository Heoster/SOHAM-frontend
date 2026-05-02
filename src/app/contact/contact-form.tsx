'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { sendContactEmail } from '@/lib/email';
import { Send, CheckCircle2 } from 'lucide-react';

const SUBJECTS = [
  'General Question',
  'Bug Report',
  'Feature Request',
  'Partnership / Collaboration',
  'Privacy / Security',
  'Other',
];

export function ContactForm() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    user_name: '',
    user_email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await sendContactEmail({
        user_name: formData.user_name,
        user_email: formData.user_email,
        message: `[${formData.subject || 'General'}]\n\n${formData.message}`,
      });

      if (!result.success) throw new Error(result.error || 'Failed to send message');

      setSubmitted(true);
      toast({
        title: 'Message sent! 📧',
        description: "We've received your message and will reply soon.",
      });
    } catch (error: unknown) {
      toast({
        title: 'Error sending message',
        description: error instanceof Error ? error.message : 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-4 py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Message Received!</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Thanks, {formData.user_name}. We&apos;ll get back to you at{' '}
              <span className="font-medium text-foreground">{formData.user_email}</span> soon.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSubmitted(false);
              setFormData({ user_name: '', user_email: '', subject: '', message: '' });
            }}
          >
            Send another message
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="user_name">Your Name</Label>
              <Input
                id="user_name"
                name="user_name"
                type="text"
                placeholder="Heoster"
                value={formData.user_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user_email">Your Email</Label>
              <Input
                id="user_email"
                name="user_email"
                type="email"
                placeholder="you@example.com"
                value={formData.user_email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <select
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">Select a subject…</option>
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              name="message"
              placeholder="Describe your question, issue, or idea in detail…"
              value={formData.message}
              onChange={handleChange}
              required
              rows={6}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {formData.message.length}/2000 characters
            </p>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || formData.message.length > 2000}
            className="w-full gap-2"
          >
            <Send className="h-4 w-4" />
            {isSubmitting ? 'Sending…' : 'Send Message'}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            By submitting, you agree to our{' '}
            <a href="/privacy" className="underline hover:text-foreground">Privacy Policy</a>.
            We never share your email.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

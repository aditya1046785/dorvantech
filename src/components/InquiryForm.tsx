'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/Button';
import { siteContent } from '@/content/site';
import { useInquiryContext } from '@/components/InquiryContext';

interface FormState {
  name: string;
  email: string;
  phone: string;
  organisation: string;
  services: string[];
  message: string;
  timeline: string;
  company_website: string; // Honeypot
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

export function InquiryForm() {
  const { selectedService } = useInquiryContext();
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    phone: '',
    organisation: '',
    services: [],
    message: '',
    timeline: 'Not sure yet',
    company_website: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState(false);
  const [startedAt, setStartedAt] = useState<number>(0);

  const nameInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    setStartedAt(Date.now());
  }, []);

  useEffect(() => {
    if (selectedService && !form.services.includes(selectedService)) {
      setForm((prev) => ({
        ...prev,
        services: [...prev.services, selectedService],
      }));
    }
  }, [selectedService]);

  const validateField = (name: string, value: string): string | undefined => {
    if (name === 'name') {
      if (!value.trim() || value.trim().length < 2 || value.length > 100) {
        return 'Enter your name.';
      }
    }
    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value.trim() || !emailRegex.test(value.trim())) {
        return 'Enter an email address like name@company.com.';
      }
    }
    if (name === 'message') {
      if (!value.trim() || value.trim().length < 20 || value.length > 2000) {
        return 'Describe your project in at least 20 characters.';
      }
    }
    return undefined;
  };

  const handleBlur = (field: 'name' | 'email' | 'message') => {
    const error = validateField(field, form[field]);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const toggleService = (value: string) => {
    setForm((prev) => {
      const services = prev.services.includes(value)
        ? prev.services.filter((s) => s !== value)
        : [...prev.services, value];
      return { ...prev, services };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasSubmitted(true);
    setServerError(false);

    const nameErr = validateField('name', form.name);
    const emailErr = validateField('email', form.email);
    const msgErr = validateField('message', form.message);

    const validationErrors: FormErrors = {
      name: nameErr,
      email: emailErr,
      message: msgErr,
    };

    setErrors(validationErrors);

    if (nameErr) {
      nameInputRef.current?.focus();
      return;
    }
    if (emailErr) {
      emailInputRef.current?.focus();
      return;
    }
    if (msgErr) {
      messageInputRef.current?.focus();
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          startedAt,
        }),
      });

      if (!response.ok) {
        throw new Error('API submission failed');
      }

      setIsSuccess(true);
      setTimeout(() => {
        successRef.current?.focus();
      }, 50);
    } catch {
      setServerError(true);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      email: '',
      phone: '',
      organisation: '',
      services: [],
      message: '',
      timeline: 'Not sure yet',
      company_website: '',
    });
    setErrors({});
    setHasSubmitted(false);
    setIsSuccess(false);
    setServerError(false);
    setStartedAt(Date.now());
  };

  const firstName = form.name.trim().split(' ')[0] || 'there';

  return (
    <div className="bg-surface border border-mist rounded-xl p-6 sm:p-8 lg:p-10 shadow-none">
      {isSuccess ? (
        <div aria-live="polite" className="flex flex-col items-start py-8">
          <h3
            ref={successRef}
            tabIndex={-1}
            className="t-h3 outline-none text-navy"
          >
            Message received
          </h3>
          <p className="t-body mt-4">
            Thanks, {firstName}. We will read your project details and reply by email.
          </p>
          <div className="mt-8">
            <Button variant="secondary" onClick={resetForm}>
              Send another inquiry
            </Button>
          </div>
        </div>
      ) : (
        <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Honeypot field (hidden) */}
          <div className="sr-only" aria-hidden="true">
            <label htmlFor="company_website">Website</label>
            <input
              type="text"
              id="company_website"
              name="company_website"
              tabIndex={-1}
              autoComplete="off"
              value={form.company_website}
              onChange={(e) =>
                setForm({ ...form, company_website: e.target.value })
              }
            />
          </div>

          {/* Name */}
          <div className="flex flex-col">
            <label htmlFor="name" className="t-h4 !text-[15px] font-semibold mb-2">
              Name <span className="t-caption text-slate font-normal">(required)</span>
            </label>
            <input
              ref={nameInputRef}
              id="name"
              type="text"
              autoComplete="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              onBlur={() => handleBlur('name')}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
              className={`h-[52px] rounded-sm border px-4 font-display text-[16px] text-navy bg-paper ${
                errors.name ? 'border-danger' : 'border-mist'
              }`}
            />
            {errors.name && (
              <span id="name-error" className="t-caption text-danger mt-1">
                {errors.name}
              </span>
            )}
          </div>

          {/* Email */}
          <div className="flex flex-col">
            <label htmlFor="email" className="t-h4 !text-[15px] font-semibold mb-2">
              Email <span className="t-caption text-slate font-normal">(required)</span>
            </label>
            <input
              ref={emailInputRef}
              id="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              onBlur={() => handleBlur('email')}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
              className={`h-[52px] rounded-sm border px-4 font-display text-[16px] text-navy bg-paper ${
                errors.email ? 'border-danger' : 'border-mist'
              }`}
            />
            {errors.email && (
              <span id="email-error" className="t-caption text-danger mt-1">
                {errors.email}
              </span>
            )}
          </div>

          {/* Phone */}
          <div className="flex flex-col">
            <label htmlFor="phone" className="t-h4 !text-[15px] font-semibold mb-2">
              Phone or WhatsApp
            </label>
            <input
              id="phone"
              type="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="h-[52px] rounded-sm border border-mist px-4 font-display text-[16px] text-navy bg-paper"
            />
          </div>

          {/* Organisation */}
          <div className="flex flex-col">
            <label htmlFor="organisation" className="t-h4 !text-[15px] font-semibold mb-2">
              Organisation
            </label>
            <input
              id="organisation"
              type="text"
              autoComplete="organization"
              value={form.organisation}
              onChange={(e) =>
                setForm({ ...form, organisation: e.target.value })
              }
              className="h-[52px] rounded-sm border border-mist px-4 font-display text-[16px] text-navy bg-paper"
            />
          </div>

          {/* Chips */}
          <div className="flex flex-col">
            <span className="t-h4 !text-[15px] font-semibold mb-3">
              What do you need?
            </span>
            <div role="group" aria-label="What do you need" className="flex flex-wrap gap-2">
              {siteContent.contact.chips.map((chip) => {
                const selected = form.services.includes(chip.value);
                return (
                  <button
                    key={chip.value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleService(chip.value)}
                    className={`h-[44px] px-[18px] rounded-full t-small font-medium flex items-center gap-1.5 transition-colors select-none ${
                      selected
                        ? 'bg-pink-400 text-white'
                        : 'bg-surface border-[1.5px] border-mist text-slate hover:border-silver'
                    }`}
                  >
                    {selected && <Check size={16} strokeWidth={1.75} aria-hidden="true" />}
                    <span>{chip.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Message */}
          <div className="flex flex-col">
            <label htmlFor="message" className="t-h4 !text-[15px] font-semibold mb-2">
              Tell us about your project{' '}
              <span className="t-caption text-slate font-normal">(required)</span>
            </label>
            <textarea
              ref={messageInputRef}
              id="message"
              rows={5}
              maxLength={2000}
              placeholder="What are you trying to achieve? Who will use it? Is anything already in place?"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              onBlur={() => handleBlur('message')}
              aria-invalid={!!errors.message}
              aria-describedby={errors.message ? 'message-error' : undefined}
              className={`rounded-sm border p-4 font-display text-[16px] text-navy bg-paper min-h-[160px] resize-y ${
                errors.message ? 'border-danger' : 'border-mist'
              }`}
            />
            <div className="flex justify-between items-center mt-1">
              <div>
                {errors.message && (
                  <span id="message-error" className="t-caption text-danger">
                    {errors.message}
                  </span>
                )}
              </div>
              <span className="t-caption text-slate">
                {form.message.length}/2000
              </span>
            </div>
          </div>

          {/* Timeline */}
          <div className="flex flex-col">
            <label htmlFor="timeline" className="t-h4 !text-[15px] font-semibold mb-2">
              Timeline
            </label>
            <div className="relative">
              <select
                id="timeline"
                value={form.timeline}
                onChange={(e) => setForm({ ...form, timeline: e.target.value })}
                className="w-full h-[52px] rounded-sm border border-mist px-4 font-display text-[16px] text-navy bg-paper appearance-none"
              >
                <option value="Not sure yet">Not sure yet</option>
                <option value="As soon as possible">As soon as possible</option>
                <option value="Within 1 to 3 months">Within 1 to 3 months</option>
                <option value="3 months or more">3 months or more</option>
              </select>
            </div>
          </div>

          {/* Server Error Alert */}
          {serverError && (
            <div role="alert" className="rounded-md border border-danger p-4 t-small text-danger bg-danger/5">
              Something went wrong and your message was not sent. Try again
              {contactEmail ? (
                <>
                  , or email us at{' '}
                  <a href={`mailto:${contactEmail}`} className="underline font-semibold">
                    {contactEmail}
                  </a>
                </>
              ) : (
                '.'
              )}
            </div>
          )}

          {/* Validation Alert */}
          {hasSubmitted && (errors.name || errors.email || errors.message) && (
            <div role="alert" className="t-small text-danger font-medium">
              Check the highlighted fields and try again.
            </div>
          )}

          {/* Submit Button */}
          <div className="flex flex-col">
            <Button
              type="submit"
              variant="primary"
              disabled={submitting}
              className="w-full"
            >
              {submitting ? 'Sending…' : 'Send project details'}
            </Button>
            <span className="t-caption text-slate mt-3 text-left">
              We reply by email. Your details are used only to respond to your inquiry.
            </span>
          </div>
        </form>
      )}
    </div>
  );
}
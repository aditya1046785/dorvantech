import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Resend } from 'resend';

export const runtime = 'nodejs';

// In-memory rate limiting map: IP -> timestamp array
const rateLimitMap = new Map<string, number[]>();

const ALLOWED_SERVICES = [
  'website',
  'custom-software',
  'ai',
  'mobile',
  'dashboard-cms',
  'integrations',
  'management',
  'unsure',
] as const;

const inquirySchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email(),
  phone: z.string().max(30).optional().default(''),
  organisation: z.string().max(120).optional().default(''),
  services: z.array(z.enum(ALLOWED_SERVICES)).default([]),
  message: z.string().trim().min(20).max(2000),
  timeline: z.string().optional().default('Not sure yet'),
  company_website: z.string().optional().default(''), // Honeypot
  startedAt: z.number(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();

    // 1. Silent rejection checks (Honeypot + Bot timing < 3000ms)
    if (json.company_website && json.company_website.trim().length > 0) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }
    if (typeof json.startedAt === 'number' && Date.now() - json.startedAt < 3000) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    // 2. Rate limiting check (5 requests per hour by IP)
    const forwardedHeader = req.headers.get('x-forwarded-for');
    const ip = forwardedHeader ? forwardedHeader.split(',')[0].trim() : '127.0.0.1';
    const now = Date.now();
    const oneHourAgo = now - 3600000;

    const timestamps = (rateLimitMap.get(ip) || []).filter((time) => time > oneHourAgo);

    if (timestamps.length >= 5) {
      return NextResponse.json({ ok: false }, { status: 429 });
    }
    timestamps.push(now);
    rateLimitMap.set(ip, timestamps);

    // 3. Schema Validation
    const parsed = inquirySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, phone, organisation, services, message, timeline } = parsed.data;

    const emailBody = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${phone || 'Not provided'}`,
      `Organisation: ${organisation || 'Not provided'}`,
      `Needs: ${services.length > 0 ? services.join(', ') : 'Not selected'}`,
      `Timeline: ${timeline}`,
      '',
      'Message:',
      message,
    ].join('\n');

    const apiKey = process.env.RESEND_API_KEY;
    const toEmail = process.env.CONTACT_TO_EMAIL;
    const fromEmail = process.env.CONTACT_FROM_EMAIL;

    // 4. Development mode fallback if API key is missing
    if (!apiKey && process.env.NODE_ENV !== 'production') {
      console.log('--- INQUIRY SUBMITTED (DEV FALLBACK) ---');
      console.log(emailBody);
      console.log('----------------------------------------');
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    if (!apiKey || !toEmail || !fromEmail) {
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    // 5. Send via Resend
    const resend = new Resend(apiKey);
    const { error: resendError } = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      replyTo: email,
      subject: `New project inquiry from ${name}`,
      text: emailBody,
    });

    if (resendError) {
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
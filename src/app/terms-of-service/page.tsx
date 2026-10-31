import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';

export const metadata: Metadata = {
  title: 'Terms of Service | DORVANTECH',
  description: 'Terms governing access to the DORVANTECH website and information about our services.',
};

const sections = [
  ['1. About these terms', <p key="body">These Terms of Service (“Terms”) apply to your access to and use of the DORVANTECH website. By using the website, you agree to these Terms. If you do not agree, please do not use it. “DORVANTECH”, “we”, “us” and “our” refer to the operator of this website.</p>],
  ['2. Website information and inquiries', <p key="body">The website provides general information about our website, software, AI and technology services. Content is for general information only and is not a binding offer, technical specification or professional advice. Submitting an inquiry does not create a client, agency, employment or other contractual relationship. A project begins only when both parties accept a written proposal, statement of work or other agreement that describes its scope, fees, schedule and responsibilities.</p>],
  ['3. Project services', <p key="body">The specific services, deliverables, milestones, review process, fees, payment schedule, client inputs, support and acceptance criteria for a project will be set out in a separate written agreement. That agreement controls if it conflicts with these website Terms. Estimates and timelines are based on the information available and may change if requirements, dependencies or client inputs change. Third-party products and services may have their own terms, availability and charges.</p>],
  ['4. Client responsibilities', <p key="body">For any project, the client is responsible for providing accurate requirements, timely feedback and materials they have the right to use; ensuring that their content, products and business practices comply with applicable law; securing their accounts and access credentials; and reviewing deliverables before use. Unless a signed agreement says otherwise, clients remain responsible for deciding whether a deliverable is suitable for their business and for maintaining appropriate backups of their own data.</p>],
  ['5. AI and automated systems', <p key="body">AI systems can produce inaccurate, incomplete, biased or outdated results. Unless expressly agreed otherwise, AI-enabled features are provided as decision-support tools and should be reviewed by a qualified person before important decisions or external use. You are responsible for selecting the information submitted to AI services and for any required notices, permissions or human review. Specific project agreements may set additional limits and responsibilities.</p>],
  ['6. Intellectual property', <p key="body">The website, its design, text, graphics, brand elements and code are owned by or licensed to DORVANTECH and protected by applicable intellectual property laws. You may view and use the website for personal or internal business evaluation. You may not copy, modify, distribute, publicly display, reverse engineer or commercially exploit website materials without our written permission, except where applicable law allows it. Ownership and licensing of project deliverables are governed by the relevant written project agreement.</p>],
  ['7. Acceptable use', <p key="body">You agree not to use this website unlawfully; interfere with its operation or security; attempt unauthorised access to systems or data; introduce malicious code; scrape or harvest information in a way that disrupts the site or violates law; submit false or abusive inquiries; or infringe another person’s rights. We may restrict access where reasonably necessary to protect the site, users or our rights.</p>],
  ['8. Third-party services and links', <p key="body">The website may link to third-party sites or describe third-party tools. We do not control or endorse those services and are not responsible for their availability, content, security, terms or privacy practices. Your use of them is at your own discretion and may be governed by separate terms between you and the provider.</p>],
  ['9. Availability and disclaimers', <p key="body">We aim to keep the website accurate and available, but do not guarantee that it will be uninterrupted, error-free, secure or current. To the extent permitted by law, the website and its content are provided “as is” and “as available”, without warranties of any kind, whether express, implied or statutory. Nothing in these Terms excludes a warranty or right that cannot lawfully be excluded.</p>],
  ['10. Limitation of liability', <p key="body">To the extent permitted by applicable law, DORVANTECH will not be liable for indirect, incidental, special, consequential or punitive loss, loss of profit, revenue, data, goodwill or business opportunity, or losses resulting from your reliance on general website information or inability to access the site. Our total liability arising from your use of the website will not exceed INR 10,000. These limits do not apply to liability that cannot legally be limited, including liability for fraud or wilful misconduct. Liability for paid project services is governed by the applicable written agreement.</p>],
  ['11. Indemnity', <p key="body">To the extent permitted by law, you agree to indemnify and hold DORVANTECH harmless from third-party claims, losses and reasonable costs arising from your unlawful use of the website, your violation of these Terms, or content and materials you submit that infringe another person’s rights. This does not apply to the extent a claim results from our own breach or unlawful conduct.</p>],
  ['12. Suspension and termination', <p key="body">We may suspend, withdraw or change any part of the website at any time, including where needed for maintenance, security or legal reasons. We may block access if we reasonably believe you have breached these Terms or created a risk to the website or others. Provisions that by their nature should continue after access ends will remain in effect.</p>],
  ['13. Governing law and disputes', <p key="body">These Terms are governed by the laws of India, without regard to conflict-of-law rules. Courts located in India will have jurisdiction over disputes relating to these Terms, subject to any mandatory consumer protections or jurisdiction rules that apply to you.</p>],
  ['14. Changes and general terms', <p key="body">We may revise these Terms by publishing an updated version on this page. Changes apply from the effective date shown below. If any provision is found unenforceable, the remaining provisions continue to apply. Our failure to enforce a provision is not a waiver. You may not transfer your rights under these Terms without our consent; we may transfer them as part of a business reorganisation.</p>],
  ['15. Contact', <p key="body">For questions about these Terms or our services, use the details in the <Link href="/#contact" className="link">contact section</Link> of this website.</p>],
];

export default function TermsOfServicePage() {
  return <><Header /><main id="main" className="container min-h-screen py-16 md:py-24">
    <div className="mx-auto max-w-[780px]">
      <p className="t-caption uppercase tracking-[0.14em] text-slate">DORVANTECH · Legal</p>
      <h1 className="t-h2 mt-4">Terms of Service</h1>
      <p className="t-lead mt-6">These terms cover your use of the DORVANTECH website and explain how separately agreed project services are handled.</p>
      <p className="t-caption mt-5">Effective date: 31 October 2026</p>
      <div className="mt-10 rounded-lg border border-mist bg-surface p-5 text-sm text-slate"><strong className="font-semibold text-navy">Project terms:</strong> A signed proposal, statement of work or service agreement will govern any project and will take precedence over these general website terms where they differ.</div>
      <div className="mt-12 divide-y divide-mist border-y border-mist">
        {sections.map(([title, content]) => <section key={title as string} className="py-7 legal-copy"><h2 className="t-h4 mb-3">{title}</h2>{content}</section>)}
      </div>
      <p className="t-body mt-10">To discuss a project, <Link href="/#contact" className="link">get in touch with DORVANTECH</Link>.</p>
    </div>
  </main><Footer /></>;
}

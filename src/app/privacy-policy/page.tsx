import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';

export const metadata: Metadata = {
  title: 'Privacy Policy | DORVANTECH',
  description: 'How DORVANTECH collects, uses and protects information when you visit our website or contact us.',
};

const sections = [
  ['1. Who we are', <p key="body">This website is operated under the name DORVANTECH (“we”, “us” or “our”). We provide website, software, AI and related technology services. If you have a question about this policy or your information, contact us using the email address shown on our <Link className="link" href="/#contact">contact section</Link>.</p>],
  ['2. Information we collect', <><p key="a">When you submit an inquiry, we collect the information you choose to provide, which may include your name, email address, phone number, organisation, services you are interested in, project timeline and message. Please do not include passwords, payment card details, sensitive personal data or confidential information in the inquiry form.</p><p key="b">Our hosting provider and systems may process technical information needed to deliver and secure the site, such as IP address, browser and device characteristics, requested pages, timestamps and error logs. The inquiry form also uses basic anti-spam checks, including a hidden honeypot field, submission timing and rate limiting.</p></>],
  ['3. How we use information', <ul key="body"><li>To read and respond to your inquiry and discuss a potential project.</li><li>To operate, secure, troubleshoot and improve this website and our communications.</li><li>To prevent spam, abuse or other misuse of the inquiry form.</li><li>To meet legal obligations and establish or defend legal claims where necessary.</li></ul>],
  ['4. Legal basis and choices', <p key="body">Where applicable privacy law requires a legal basis, we process inquiry details to take steps at your request before entering a contract, to pursue our legitimate interests in operating and securing the site, or to comply with law. If we rely on consent for a specific use, you may withdraw it at any time. You can choose not to provide optional fields, though we may be unable to respond without your name, email address and project message.</p>],
  ['5. Sharing and service providers', <p key="body">We do not sell personal information. We share it only as needed with providers that help operate the website or handle inquiries, such as website hosting and email delivery services (including Resend when configured), and with professional advisers or authorities where required by law. These providers process information under their own terms and safeguards. We may also transfer information as part of a business reorganisation, subject to applicable law.</p>],
  ['6. International processing', <p key="body">Our service providers may process information in countries other than the country where you live. Where required, we use appropriate safeguards for international transfers. The privacy and data protection laws in those countries may differ from those in your jurisdiction.</p>],
  ['7. Retention', <p key="body">We keep inquiry information for as long as needed to respond, maintain a record of business discussions, provide agreed services and meet legal, accounting or dispute-resolution requirements. Retention periods depend on the nature of the inquiry and any resulting engagement. We delete or anonymise information when it is no longer needed, unless law requires us to keep it longer.</p>],
  ['8. Cookies and analytics', <p key="body">This website does not currently use advertising cookies or analytics tools for cross-site tracking. Essential technical storage or logs may be used by the hosting platform to deliver and protect the site. If we add non-essential cookies or analytics in the future, we will update this policy and provide any consent choices required by law.</p>],
  ['9. Security', <p key="body">We use reasonable technical and organisational measures designed to protect information against unauthorised access, loss or misuse. No website, transmission or storage system can be guaranteed completely secure. Please contact us promptly if you believe information you sent to us has been exposed or misused.</p>],
  ['10. Your privacy rights', <p key="body">Depending on where you live, you may have rights to request access to, correction or deletion of personal information, restrict or object to certain processing, receive a portable copy, or complain to a privacy regulator. To make a request, contact us using the details on our contact section. We may need to verify your identity and may retain information where the law permits or requires it.</p>],
  ['11. Children', <p key="body">This website and our services are intended for businesses and adults. We do not knowingly collect personal information from children. If you believe a child has provided information to us, please contact us so we can take appropriate steps.</p>],
  ['12. Third-party websites', <p key="body">Our website may link to third-party websites or services. Their privacy practices are governed by their own policies, and we are not responsible for their content or handling of information. Review their policies before providing them with personal information.</p>],
  ['13. Changes to this policy', <p key="body">We may update this policy when our practices or legal requirements change. The revised version will be published on this page with an updated effective date. If a change materially affects information already collected, we will take any additional steps required by law.</p>],
];

export default function PrivacyPolicyPage() {
  return <><Header /><main id="main" className="container min-h-screen py-16 md:py-24">
    <div className="mx-auto max-w-[780px]">
      <p className="t-caption uppercase tracking-[0.14em] text-slate">DORVANTECH · Legal</p>
      <h1 className="t-h2 mt-4">Privacy Policy</h1>
      <p className="t-lead mt-6">This policy explains what information we handle when you visit this website or get in touch with DORVANTECH, and how we use and protect it.</p>
      <p className="t-caption mt-5">Effective date: 31 October 2026</p>
      <div className="mt-10 rounded-lg border border-mist bg-surface p-5 text-sm text-slate"><strong className="font-semibold text-navy">A note about project work:</strong> If you become a client, the handling of information in your product, website or systems will also be governed by your project agreement and any separate data-processing terms.</div>
      <div className="mt-12 divide-y divide-mist border-y border-mist">
        {sections.map(([title, content]) => <section key={title as string} className="py-7 legal-copy"><h2 className="t-h4 mb-3">{title}</h2>{content}</section>)}
      </div>
      <p className="t-body mt-10">Questions or requests about privacy? <Link href="/#contact" className="link">Contact DORVANTECH</Link>.</p>
    </div>
  </main><Footer /></>;
}

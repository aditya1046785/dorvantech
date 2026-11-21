import { ManagedProjects } from "@/components/ManagedProjects";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { InquiryProvider } from "@/components/InquiryContext";
import { InquiryForm } from "@/components/InquiryForm";
import { SpatialScene } from "@/components/SpatialScene";
import {
  ServiceExplorer,
  ProcessExplorer,
  Questions,
} from "@/components/Experience";
import { siteContent } from "@/content/site";
import { Check, Code2, Layers3, Handshake } from "lucide-react";

export const dynamic = "force-dynamic";
export default function HomePage() {
  return (
    <InquiryProvider>
      <Header />
      <main id="main">
        <section className="hero section-wrap" id="hero">
          <div className="hero-copy">
            <p className="eyebrow hero-eyebrow">
              <span /> YOUR BUSINESS. CONNECTED.
            </p>
            <h1>
              Good ideas.
              <br />
              Great systems.
              <br />
              <span>Built together.</span>
            </h1>
            <p className="hero-description">
              Custom websites, software and AI that work for your business. From
              the first conversation to life after launch.
            </p>
            <div className="hero-actions">
              <Link className="action action-primary" href="#contact">
                Discuss your project
              </Link>
              <Link className="action action-secondary" href="#work">
                Explore our work
              </Link>
            </div>
            <p className="hero-note">
              Founder-led. Clear scope. A direct line to your builder.
            </p>
          </div>
          <div className="hero-art">
            <div className="orbit-glow" />
            <SpatialScene />
            <div className="system-caption">
              <span>THE DORVANTECH APPROACH</span>
              <span>Experience + intelligence + infrastructure</span>
            </div>
          </div>
        </section>
        <div className="promise-strip section-wrap">
          <div>
            <Code2 size={21} />
            <span>Built for your business</span>
          </div>
          <div>
            <Handshake size={21} />
            <span>Collaborative from day one</span>
          </div>
          <div>
            <Layers3 size={21} />
            <span>Support beyond launch</span>
          </div>
        </div>

        <ManagedProjects />

        <section id="services" className="section-band">
          <div className="section-wrap section-space">
            <div className="section-heading">
              <div>
                <p className="eyebrow">OUR CAPABILITIES</p>
                <h2>
                  The right pieces.
                  <br />
                  <span>One connected system.</span>
                </h2>
              </div>
              <p>
                Start with what you need. We’ll help you connect the rest.
                Explore a service to see what’s possible.
              </p>
            </div>
            <ServiceExplorer />
          </div>
        </section>

        <section
          id="partnership"
          className="section-wrap section-space partnership"
        >
          <div>
            <p className="eyebrow">A PARTNER, FROM START TO SCALE</p>
            <h2>
              We build it.
              <br />
              <span>We can look after it.</span>
            </h2>
            <p className="section-intro">
              You shouldn’t have to coordinate multiple technology providers.
              Work directly with the person building your project, with clear
              responsibilities from the beginning.
            </p>
            <Link className="text-link" href="#contact">
              Let’s talk about what you need
            </Link>
          </div>
          <div className="engagements">
            {siteContent.partnership.engagements.map((item, index) => (
              <div key={item.type}>
                <span className="engagement-icon">
                  {index === 0 ? (
                    <Code2 />
                  ) : index === 1 ? (
                    <Layers3 />
                  ) : (
                    <Handshake />
                  )}
                </span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </div>
            ))}
            <p className="engagement-note">
              Hosting, support and maintenance are optional, with scope and
              costs agreed separately from development.
            </p>
          </div>
        </section>

        <section id="process" className="section-band">
          <div className="section-wrap section-space">
            <div className="section-heading">
              <div>
                <p className="eyebrow">HOW WE WORK</p>
                <h2>
                  No guesswork.
                  <br />
                  <span>Just forward progress.</span>
                </h2>
              </div>
              <p>
                You’ll know what’s being built, why it matters and what comes
                next. Select a stage to explore.
              </p>
            </div>
            <ProcessExplorer />
            <p className="process-note">
              Progress updates come directly from us. A client project dashboard
              is planned, but is not available yet.
            </p>
          </div>
        </section>

        <section className="section-wrap section-space" id="who-we-help">
          <div className="section-heading">
            <div>
              <p className="eyebrow">BUILT AROUND YOU</p>
              <h2>
                Wherever you are,
                <br />
                <span>let’s move you forward.</span>
              </h2>
            </div>
            <p>
              You don’t need to be technical to start. Bring the problem, the
              idea or the part you need help with.
            </p>
          </div>
          <div className="audience-grid">
            {siteContent.audiences.items.map((item, i) => (
              <article key={item.title}>
                <span className="audience-symbol" aria-hidden="true">
                  {["◇", "⌘", "⌥"][i]}
                </span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <ul>
                  {item.needs.map((need) => (
                    <li key={need}>
                      <Check size={16} />
                      <span>{need}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <div className="principle-strip">
            {siteContent.principles.items.map((item) => (
              <div key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="faq" className="section-wrap section-space faq-layout">
          <div>
            <p className="eyebrow">A LITTLE MORE CLARITY</p>
            <h2>
              Good questions.
              <br />
              <span>Plain answers.</span>
            </h2>
            <p className="section-intro">Still have something on your mind?</p>
            <Link className="text-link" href="#contact">
              Ask us directly
            </Link>
          </div>
          <Questions />
        </section>

        <section id="contact" className="contact-band">
          <div className="section-wrap section-space contact-layout">
            <div className="contact-copy">
              <p className="eyebrow">LET’S BUILD SOMETHING USEFUL</p>
              <h2>
                Your next chapter
                <br />
                <span>
                  starts with a<br />
                  conversation.
                </span>
              </h2>
              <p className="section-intro">
                Tell us what you’re trying to achieve. A rough idea is a
                perfectly good place to start.
              </p>
              <div className="next-steps">
                <h3>What happens next</h3>
                {siteContent.contact.steps.map((step, i) => (
                  <div key={step}>
                    <span>{i + 1}</span>
                    <p>{step}</p>
                  </div>
                ))}
              </div>
              <p className="hero-note">
                You’ll work directly with the founder.
              </p>
              {process.env.NEXT_PUBLIC_CONTACT_EMAIL && (
                <a
                  className="text-link"
                  href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL}`}
                >
                  {process.env.NEXT_PUBLIC_CONTACT_EMAIL}
                </a>
              )}
            </div>
            <InquiryForm />
          </div>
        </section>
      </main>
      <Footer />
    </InquiryProvider>
  );
}

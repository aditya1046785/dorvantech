import Link from "next/link";
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="section-wrap">
        <div className="footer-top">
          <div>
            <Link className="wordmark" href="/">
              DORVANTECH<span className="brand-period">.</span>
            </Link>
            <p>
              Thoughtfully built.
              <br />
              Ready for what’s next.
            </p>
          </div>
          <nav aria-label="Footer navigation">
            <Link href="/#work">Our work</Link>
            <Link href="/#services">Services</Link>
            <Link href="/#process">Our process</Link>
            <Link href="/careers">Internships & vacancies</Link>
            <Link href="/#contact">Start a conversation</Link>
          </nav>
          <nav aria-label="Project navigation">
            <Link href="/work/nirashray-foundation">Nirashray Foundation</Link>
            <Link href="/work/beats">BEATS</Link>
            <Link href="/work/ai-career-agent">AI Career Agent</Link>
          </nav>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} DORVANTECH</span>
          <span>Built with care. Connected by design.</span>
          <div>
            <Link href="/privacy-policy">Privacy</Link>
            <Link href="/terms-of-service">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

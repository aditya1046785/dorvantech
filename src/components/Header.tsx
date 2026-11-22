"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export function Header() {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    const resize = () => {
      if (window.innerWidth >= 1024) setOpen(false);
    };
    window.addEventListener("keydown", close);
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("keydown", close);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <header className="site-header">
        <div className="section-wrap header-inner">
          <Link href="/" className="wordmark" aria-label="DORVANTECH home">
            
            DORVANTECH<span className="brand-period">.</span>
          </Link>
          <button
            ref={toggle}
            className="menu-toggle"
            aria-expanded={open}
            aria-controls="primary-navigation"
            aria-label={open ? "Close navigation" : "Open navigation"}
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
          <nav
            id="primary-navigation"
            className={open ? "main-nav is-open" : "main-nav"}
            aria-label="Primary"
          >
            {[
              ["Work", "work"],
              ["Services", "services"],
              ["Approach", "partnership"],
              ["Process", "process"],
              ["FAQ", "faq"],
            ].map(([label, id]) => (
              <Link key={id} href={`/#${id}`} onClick={() => setOpen(false)}>
                {label}
              </Link>
            ))}
            <Link href="/careers" onClick={() => setOpen(false)}>Vacancies</Link>
            <Link
              className="action action-small"
              href="/#contact"
              onClick={() => setOpen(false)}
            >
              Let’s talk
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
}

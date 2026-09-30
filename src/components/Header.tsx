'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/Button';

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 8);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { label: 'Services', href: '/#services' },
    { label: 'Approach', href: '/#partnership' },
    { label: 'Work', href: '/#work' },
    { label: 'Process', href: '/#process' },
    { label: 'FAQ', href: '/#faq' },
  ];

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 bg-navy text-white rounded-full px-4 py-2 font-display text-[14px]"
      >
        Skip to main content
      </a>

      <header
        className={`sticky top-0 z-40 bg-paper h-[60px] md:h-[68px] transition-[border-color] duration-200 ${
          scrolled ? 'border-b border-mist' : 'border-b border-transparent'
        }`}
      >
        <div className="container h-full flex items-center justify-between">
          <Link href="/" className="inline-flex items-center" aria-label="DORVANTECH home">
            {!logoError ? (
              <Image
                src="/brand/logo.svg"
                alt="DORVANTECH"
                width={140}
                height={28}
                className="h-[24px] md:h-[28px] w-auto"
                onError={() => setLogoError(true)}
                priority
              />
            ) : (
              <span className="font-display font-bold text-[20px] tracking-[0.04em] text-navy">
                DORVANTECH
              </span>
            )}
          </Link>

          <nav className="hidden lg:flex items-center gap-[32px]" aria-label="Primary">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="t-small font-medium text-navy hover:underline decoration-signal decoration-2 underline-offset-[6px] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center">
            <Button variant="primary" href="/#contact" className="!h-[44px]">
              Discuss your project
            </Button>
          </div>

          <button
            type="button"
            className="lg:hidden w-[44px] h-[44px] flex items-center justify-center text-navy"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X size={24} strokeWidth={1.75} /> : <Menu size={24} strokeWidth={1.75} />}
          </button>
        </div>
      </header>

      {mobileMenuOpen && (
        <div
          ref={menuRef}
          className="fixed inset-0 top-[60px] z-40 bg-paper flex flex-col justify-between p-6 transition-opacity duration-180 lg:hidden"
        >
          <nav className="flex flex-col gap-5 pt-4" aria-label="Mobile Navigation">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="font-display font-bold text-[34px] text-navy text-left"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="pb-6">
            <Button
              variant="primary"
              href="/#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full"
            >
              Discuss your project
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
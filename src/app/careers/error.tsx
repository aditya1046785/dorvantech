"use client";
import Link from "next/link";
export default function CareersError({reset}: {reset: () => void}) {
  return <main id="main" className="section-wrap careers-page"><div className="careers-heading"><p className="eyebrow">DORVANTECH CAREERS</p><h1>We couldn’t load this page.</h1><p>Please try again in a moment.</p></div><div className="hero-actions"><button className="action action-primary" onClick={reset}>Try again</button><Link className="action action-secondary" href="/careers">All vacancies</Link></div></main>;
}

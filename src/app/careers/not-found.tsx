import Link from "next/link";
export default function VacancyNotFound() {
  return <main id="main" className="section-wrap careers-page"><div className="careers-heading"><p className="eyebrow">DORVANTECH CAREERS</p><h1>Opportunity unavailable.</h1><p>This vacancy may have been removed or the address may be incorrect.</p></div><Link href="/careers" className="action action-secondary">View available vacancies</Link></main>;
}

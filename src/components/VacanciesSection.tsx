import Link from "next/link";
import { publicVacancies } from "@/lib/vacancies";

export async function VacanciesSection() {
  const vacancies = await publicVacancies();
  const count = vacancies?.filter((v) => v.open).length ?? 0;
  return <section id="vacancies" className="section-band">
    <div className="section-wrap section-space careers-intro">
      <div><p className="eyebrow">INTERNSHIPS & VACANCIES</p><h2>Your next chapter.<br/><span>Build it with us.</span></h2></div>
      <div><p>Explore opportunities at DORVANTECH. Find a role that fits your skills, interests and ambitions.</p>
        <p className="careers-count">{vacancies === null ? "Opportunities will be listed here soon." : count ? `${count} ${count === 1 ? "position" : "positions"} listed` : "No open positions right now."}</p>
        <Link className="action action-secondary" href="/careers">View vacancies</Link>
      </div>
    </div>
  </section>;
}

"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Globe2,
  Layers3,
  BrainCircuit,
  Smartphone,
  PanelsTopLeft,
  Workflow,
  Server,
  Plus,
  Minus,
  Check,
} from "lucide-react";
import { siteContent } from "@/content/site";
import { useInquiryContext } from "./InquiryContext";

const icons = [
  Globe2,
  Layers3,
  BrainCircuit,
  Smartphone,
  PanelsTopLeft,
  Workflow,
  Server,
];
export function ServiceExplorer() {
  const [active, setActive] = useState(0);
  const { setSelectedService } = useInquiryContext();
  const service = siteContent.services.items[active];
  const Icon = icons[active];
  return (
    <div className="service-explorer">
      <div className="service-list" aria-label="Explore services">
        {siteContent.services.items.map((item, index) => {
          const ServiceIcon = icons[index];
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={index === active}
              aria-controls="service-detail"
              onClick={() => setActive(index)}
            >
              <ServiceIcon size={20} strokeWidth={1.5} />
              <span>{item.title}</span>
              <span className="service-indicator">
                {index === active ? "−" : "+"}
              </span>
            </button>
          );
        })}
      </div>
      <div id="service-detail" className="service-detail" aria-live="polite">
        <div className="service-detail-top">
          <span className="eyebrow">
            {service.tag === "managed"
              ? "Beyond launch"
              : "Built around your business"}
          </span>
          <Icon size={40} strokeWidth={1} />
        </div>
        <div className="service-system" aria-hidden="true">
          {["Experience", "Intelligence", "Infrastructure"].map((name, i) => (
            <span
              key={name}
              className={i === [0, 2, 1, 0, 0, 2, 2][active] ? "is-active" : ""}
            >
              {name}
            </span>
          ))}
        </div>
        <h3>{service.oneLiner}</h3>
        <p>{service.description}</p>
        <div className="service-examples">
          <span className="eyebrow">What this can include</span>
          <p>{service.typicalProjects}</p>
        </div>
        <Link
          className="action action-primary"
          href="#contact"
          onClick={() => setSelectedService(service.chipKey)}
        >
          Discuss this service
        </Link>
      </div>
    </div>
  );
}

export function ProcessExplorer() {
  const [active, setActive] = useState(0);
  const step = siteContent.process.items[active];
  return (
    <div className="process-explorer">
      <div className="process-stages" aria-label="Project stages">
        {siteContent.process.items.map((item, i) => (
          <button
            key={item.number}
            type="button"
            aria-pressed={active === i}
            aria-controls="process-detail"
            onClick={() => setActive(i)}
          >
            <span className="stage-mark">
              {i < active ? <Check size={18} /> : i + 1}
            </span>
            <span>
              {["Discover", "Define", "Build", "Launch", "Support"][i]}
              {i === 4 && <small>Optional</small>}
            </span>
          </button>
        ))}
      </div>
      <div className="process-detail" id="process-detail" aria-live="polite">
        <div>
          <span className="eyebrow">
            {active === 4
              ? "An ongoing partnership, if you need it"
              : "A clear path from idea to launch"}
          </span>
          <h3>{step.title}</h3>
          <p>{step.summary}</p>
        </div>
        <div className="process-deliverables">
          <h4>{step.col1Title}</h4>
          <ul>
            {step.col1Items.map((item) => (
              <li key={item}>
                <Check size={16} />
                {item}
              </li>
            ))}
          </ul>
          <h4>{step.col2Title}</h4>
          <ul>
            {step.col2Items.map((item) => (
              <li key={item}>
                <Check size={16} />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function Questions() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="questions">
      {siteContent.faq.items.map((item, index) => (
        <div className="question" key={item.question}>
          <h3>
            <button
              type="button"
              onClick={() => setOpen(open === index ? null : index)}
              aria-expanded={open === index}
              aria-controls={`answer-${index}`}
            >
              <span>{item.question}</span>
              {open === index ? <Minus size={20} /> : <Plus size={20} />}
            </button>
          </h3>
          <div id={`answer-${index}`} hidden={open !== index}>
            <p>{item.answer}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

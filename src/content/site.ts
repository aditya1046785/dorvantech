export interface ServiceItem {
  id: string;
  title: string;
  tag: 'build' | 'managed';
  oneLiner: string;
  description: string;
  typicalProjects: string;
  chipKey: string;
}

export interface NirashrayTab {
  id: string;
  label: string;
  description: string;
  variant:
    | 'page'
    | 'editor'
    | 'dashboard'
    | 'member'
    | 'form'
    | 'email'
    | 'login'
    | 'gallery'
    | 'idcard';
  image: string | null;
  alt: string;
}

export interface ProcessItem {
  number: string;
  title: string;
  summary: string;
  col1Title: string;
  col1Items: string[];
  col2Title: string;
  col2Items: string[];
  isHatched?: boolean;
}

export interface AudienceItem {
  title: string;
  description: string;
  needs: string[];
}

export interface PrincipleItem {
  title: string;
  description: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export const siteContent = {
  hero: {
    title: 'Technology that works for your business.',
    lead: 'DORVANTECH designs and builds custom websites, software systems and AI-powered tools, and can keep managing them after launch. From the first idea to long-term management, we take care of the technology so you can focus on your business.',
    microLine: "Founder-led. Tell us what you need and we'll reply by email.",
    pillars: [
      {
        title: 'Capability',
        text: 'We build the technology your business needs.',
      },
      {
        title: 'Collaboration',
        text: 'You see what is being built and stay involved throughout.',
      },
      {
        title: 'Responsibility',
        text: 'We can keep managing it after delivery, under an agreed arrangement.',
      },
    ],
  },
  services: {
    heading: 'What we build, and what we look after.',
    lead: 'Choose the parts you need. Most projects combine a few.',
    items: [
      {
        id: 'websites-ecommerce',
        title: 'Websites and e-commerce',
        tag: 'build',
        oneLiner: 'Websites built around a business goal, not just a look.',
        description:
          'Company sites, landing pages, portfolios, nonprofit sites and online stores, designed to communicate your brand and support how your business actually runs. Content-managed and connected to backend systems where the project needs it.',
        typicalProjects:
          'Business and corporate websites, company and brand sites, landing pages, portfolio and professional sites, nonprofit and organisation sites, content-managed sites, online stores.',
        chipKey: 'website',
      },
      {
        id: 'custom-software',
        title: 'Custom software and full-stack applications',
        tag: 'build',
        oneLiner: 'Software shaped around your workflows, users and business model.',
        description:
          'Business management systems, customer platforms, membership systems, internal tools and data-driven applications. Front end, back end, database, sign-in, APIs and integrations, planned and built as one system, from architecture through deployment.',
        typicalProjects:
          'Business management systems, custom web applications, internal tools, customer-facing platforms, membership and user management, workflow applications.',
        chipKey: 'custom-software',
      },
      {
        id: 'ai-agents',
        title: 'AI agents and RAG systems',
        tag: 'build',
        oneLiner: 'AI that works with your own information and processes.',
        description:
          "A RAG system answers questions using your company's own documents or knowledge base. An AI agent supports a defined task or workflow using AI and connected tools. We build both, add AI to existing web applications, and set clear limits on what each should and should not do. AI can make mistakes, so we design for human review, not blind trust.",
        typicalProjects:
          'AI agents for specific workflows, AI assistants and tools, knowledge assistants over approved documents, AI-powered search, AI features inside existing applications, workflow automation with AI models and external services.',
        chipKey: 'ai',
      },
      {
        id: 'mobile-applications',
        title: 'Mobile applications',
        tag: 'build',
        oneLiner: 'Custom apps for customers, teams and communities.',
        description:
          'Mobile apps built around your requirements and connected to your web platform and backend systems, or a mobile interface for a product you already run.',
        typicalProjects:
          'Customer apps, business and employee apps, member and community apps, mobile front ends for existing products.',
        chipKey: 'mobile',
      },
      {
        id: 'cms-dashboards',
        title: 'CMS, dashboards and portals',
        tag: 'build',
        oneLiner: 'So you can run things without calling a developer.',
        description:
          'Edit pages, publish updates and manage images through a secure admin area. Give admins, members, customers or employees their own dashboards with role-based access, so each person sees only what they should.',
        typicalProjects:
          'Admin dashboards, member dashboards, customer and employee portals, user account management, reporting interfaces, content management.',
        chipKey: 'dashboard-cms',
      },
      {
        id: 'api-integrations',
        title: 'API integrations and business automation',
        tag: 'build',
        oneLiner: 'Connect the tools you already use.',
        description:
          'Payment gateways, email services, third-party APIs and existing business systems, linked through custom backend services and automated workflows. We work with your current setup wherever it makes sense, instead of asking you to replace everything.',
        typicalProjects:
          'Payment gateway integration, email service integration, third-party APIs, connections between existing systems, internal management tools, automated data exchange.',
        chipKey: 'integrations',
      },
      {
        id: 'hosting-infrastructure',
        title: 'Hosting, infrastructure and ongoing management',
        tag: 'managed',
        oneLiner: 'Optional. One team responsible for the technology we build.',
        description:
          'After launch, choose the level of support you want: domain setup, hosting and deployment, database upkeep, updates, troubleshooting, bug fixes and technical requests. Terms and costs are agreed clearly and separately from the build.',
        typicalProjects:
          'Domain configuration, hosting and deployment management, database maintenance, application updates, cloud configuration, troubleshooting, agreed maintenance work.',
        chipKey: 'management',
      },
    ] as ServiceItem[],
  },
  partnership: {
    heading: 'Built for your business. Supported beyond launch.',
    lead: 'You should not have to coordinate several technology providers or work out every technical detail yourself. DORVANTECH understands what you need, builds it, and can keep looking after it once it is live.',
    builtNote:
      'You receive the agreed requirements, regular progress updates, a tested product and handover documentation.',
    managedItems: [
      'Hosting and deployment',
      'Domains',
      'Databases',
      'Updates',
      'Troubleshooting and bug fixes',
      'Technical requests',
    ],
    engagements: [
      {
        type: 'build' as const,
        title: 'Development',
        description:
          'Planning, design, building, testing, deployment and handover of your project, scoped and agreed up front.',
      },
      {
        type: 'managed' as const,
        title: 'Managed services',
        description:
          'Optional. We look after hosting, domains, databases, deployment and technical requests for you. You choose how much involvement you want.',
      },
      {
        type: 'plan' as const,
        title: 'Maintenance plan',
        description:
          'Agreed separately. Updates, bug fixes and support work under defined terms and costs.',
      },
    ],
    noteStrip:
      'Hosting, infrastructure, support and maintenance are not automatically part of every development project. We agree each one with you separately, in plain terms.',
  },
  work: {
    heading: 'Real software, not just websites.',
    lead: 'Three products we have built, with the interfaces to show for them.',
    nirashray: {
      name: 'Nirashray Foundation',
      positioning:
        'A complete digital platform for organisational operations.',
      description:
        'DORVANTECH built a connected digital platform combining the foundation’s public website with content management, administrative and member dashboards, payment integration, automated email communication, user authentication, dynamic gallery updates and ID card generation.',
      url: 'https://nirashray-foundation.vercel.app/',
      tabs: [
        {
          id: 'public-site',
          label: 'Public website',
          description:
            'The foundation’s online presence, connected to the platform behind it.',
          variant: 'page',
          image: "/work/nirashray/01-public-site.png",
          alt: 'Public website of Nirashray Foundation',
        },
        {
          id: 'cms',
          label: 'Custom CMS',
          description:
            'Authorised admins update website content from the dashboard, so routine changes need no code.',
          variant: 'editor',
          image: "/work/nirashray/02-cms.png",
          alt: 'Content editing screen in the Nirashray dashboard',
        },
        {
          id: 'admin-dashboard',
          label: 'Admin dashboard',
          description:
            'Manage the platform and its operational data in one place.',
          variant: 'dashboard',
          image:  "/work/nirashray/03-admin-dashboard.png",
          alt: 'Nirashray admin dashboard',
        },
        {
          id: 'member-dashboard',
          label: 'Member dashboard',
          description:
            'A separate experience where members access their own information and features.',
          variant: 'member',
          image:  "/work/nirashray/04-member-dashboard.png",
          alt: 'Nirashray member dashboard',
        },
        {
          id: 'payments',
          label: 'Online payments',
          description:
            'Payment integration for the foundation’s payment and donation workflows.',
          variant: 'form',
          image:  "/work/nirashray/05-payments.png",
          alt: 'Payment screen in the Nirashray platform',
        },
        {
          id: 'emails',
          label: 'Event-triggered emails',
          description:
            'Custom email setup, with automated emails sent when specific events happen in the platform.',
          variant: 'email',
          image:  "/work/nirashray/06-emails.png",
          alt: 'Automated email template sent by the Nirashray platform',
        },
        {
          id: 'auth',
          label: 'Signup and login',
          description:
            'Account creation and sign-in for the platform’s users.',
          variant: 'login',
          image: "/work/nirashray/07-auth.png",
          alt: 'Signup and login screen',
        },
        {
          id: 'gallery',
          label: 'Dynamic gallery',
          description:
            'Admins update the gallery from the dashboard, and the public site reflects it.',
          variant: 'gallery',
          image: "/work/nirashray/08-gallery.png",
          alt: 'Gallery managed from the Nirashray dashboard',
        },
        {
          id: 'id-card',
          label: 'Member ID cards',
          description:
            'Member ID cards generated from the platform’s member information.',
          variant: 'idcard',
          image: "/work/nirashray/09-id-card.png",
          alt: 'Generated member ID card (redacted)',
        },
      ] as NirashrayTab[],
      strip: {
        title: 'One update, everywhere it matters.',
        caption:
          'An admin updates the gallery or content in the dashboard, and the public website reflects it.',
        nodes: [
          'Admin dashboard',
          'Gallery and content',
          'Public website',
        ],
      },
    },
    beats: {
      name: 'BEATS',
      positioning: 'Turn your GitHub work into a resume.',
      description:
        'A developer-focused product that helps developers transform their GitHub projects and coding activity into a structured resume.',
      url: 'https://beats.cerecrafts.in',
      flowNodes: [
        'GitHub profile',
        'Projects and activity',
        'Structured resume',
      ],
      stack: [] as string[],
      images: [] as string[],
    },
    careerAgent: {
      name: 'AI Career Agent',
      positioning: 'Discover opportunities that match your career.',
      description:
        'An AI-powered job discovery and filtering system that helps candidates find and evaluate relevant job opportunities.',
      url: null,
      flowNodes: [
        'Online job sources',
        'Listing extraction',
        'Filter for the candidate',
        'Rank by relevance',
        'AI-assisted evaluation',
      ],
      stack: [] as string[],
      images: [] as string[],
    },
  },
  process: {
    heading: 'How a project runs.',
    lead: 'You will know what is being built, why, and where it stands at every stage.',
    items: [
      {
        number: '01',
        title: 'Discover and understand',
        summary:
          'You tell us about your business, the problem and the outcome you want. We ask questions until we understand the real need, before proposing any technology.',
        col1Title: 'What we do',
        col1Items: [
          'Ask about your goals, users and constraints',
          'Identify what the solution must achieve',
        ],
        col2Title: 'Your part',
        col2Items: [
          'Explain your business and the problem',
          'Share what success looks like',
        ],
      },
      {
        number: '02',
        title: 'Define the scope and plan',
        summary:
          'We turn what we learned into a structured plan, often a Product Requirements Document (PRD) written in plain language. The depth depends on the size of the project.',
        col1Title: 'The plan can include',
        col1Items: [
          'Objectives and required features',
          'User roles and workflows',
          'Scope boundaries and technical considerations',
          'Delivery milestones',
          'Estimated timeline and cost',
        ],
        col2Title: 'You receive',
        col2Items: [
          'A copy of the agreed requirements before development starts',
        ],
      },
      {
        number: '03',
        title: 'Design and develop together',
        summary:
          'We build to the agreed scope and share meaningful progress along the way, so you are never waiting until the end to see what you are paying for.',
        col1Title: 'What we do',
        col1Items: [
          'Build the agreed solution',
          'Share progress updates',
        ],
        col2Title: 'Your part',
        col2Items: [
          'Review work in progress',
          'Give feedback',
          'Help make important decisions',
        ],
      },
      {
        number: '04',
        title: 'Test, deploy and deliver',
        summary:
          'We test the product, deploy it and hand it over with the documentation, access and information agreed for your project. The goal is a product you can use, not just a code repository.',
        col1Title: 'What we do',
        col1Items: [
          'Test against the agreed requirements',
          'Deploy and hand over',
        ],
        col2Title: 'You receive',
        col2Items: [
          'A working product',
          'Agreed documentation, access and information',
        ],
      },
      {
        number: '05',
        title: 'Support and manage',
        summary:
          'After launch you can choose ongoing maintenance and technical management: application updates, hosting, domains, databases, troubleshooting and agreed technical requests. This is optional, and terms and costs are agreed clearly.',
        col1Title: 'What we can manage',
        col1Items: [
          'Hosting and deployment',
          'Domains and databases',
          'Updates and troubleshooting',
          'Agreed technical requests',
        ],
        col2Title: 'Your part',
        col2Items: ['Choose the level of support you want'],
        isHatched: true,
      },
    ] as ProcessItem[],
    dashboardBlock: {
      title: 'Client project dashboard',
      body: 'We are planning a dashboard where clients will be able to follow project progress and milestones, development updates, task status, key documents and project communication. It is not available yet. Today, we share progress updates with you directly.',
    },
  },
  audiences: {
    heading: 'Businesses, founders and technical teams.',
    lead: 'You do not need to be technical to start a conversation.',
    items: [
      {
        title: 'Businesses and organisations',
        description:
          'Digitise how you work. Whether you have manual processes, disconnected tools or an online presence that does not match your business, we build the website, portal or internal system and can manage it afterwards.',
        needs: [
          'A website, customer portal or internal software',
          'Dashboards, workflows and integrations',
          'Someone to manage your existing technology',
        ],
      },
      {
        title: 'Startups and founders',
        description:
          'Get from idea to a working product. We help you scope it, build it and validate the idea before you invest heavily, and stay on to extend or maintain it.',
        needs: [
          'An MVP or full web application',
          'A technical partner to turn requirements into software',
          'Help extending an existing product',
        ],
      },
      {
        title: 'Developers and technology companies',
        description:
          'Add capacity without adding overhead. We build custom modules, APIs, backend systems, dashboards and integrations, or support ongoing product work, to an agreed scope.',
        needs: [
          'Custom modules and integrations',
          'Backend systems and APIs',
          'Development help on a specific component',
        ],
      },
    ] as AudienceItem[],
  },
  principles: {
    heading: "We don't compromise on what matters.",
    lead: 'Thoughtful engineering. Clear scope. No unnecessary compromises.',
    items: [
      {
        title: 'Scoped to you',
        description:
          'Your project deserves a solution built around its requirements, not an arbitrary package.',
      },
      {
        title: 'Clear before we start',
        description:
          'You will know what is proposed, what is included, and the expected timeline and cost before development begins.',
      },
      {
        title: 'Changes handled openly',
        description:
          'Anything outside the agreed scope is discussed separately, so there are no surprises.',
      },
      {
        title: 'Defined ongoing terms',
        description:
          'Hosting, infrastructure and maintenance come with clearly defined terms and costs.',
      },
    ] as PrincipleItem[],
    sheetRows: [
      { label: 'Project objectives', barWidth: '80%' },
      { label: 'Required features', barWidth: '65%' },
      { label: 'User roles and workflows', barWidth: '90%' },
      { label: 'Scope boundaries', barWidth: '55%' },
      { label: 'Technical considerations', barWidth: '75%' },
      { label: 'Delivery milestones', barWidth: '70%' },
      { label: 'Estimated timeline and cost', barWidth: '60%' },
    ],
  },
  faq: {
    heading: 'Questions, answered plainly.',
    items: [
      {
        question: 'Do I need to understand the technology?',
        answer:
          'No. Describe your business problem in plain language. We explain the options and trade-offs without jargon, and write the scope down for you to review.',
      },
      {
        question: 'Are hosting and maintenance included?',
        answer:
          'Not automatically. Development, managed services and maintenance are separate, and we agree each one with you with clear terms and costs.',
      },
      {
        question: 'Can you work with the tools we already use?',
        answer:
          'Yes, wherever it makes sense. We can integrate with existing tools and services, extend an existing product, or connect your systems, rather than ask you to replace everything.',
      },
      {
        question: 'Can an AI system give wrong answers?',
        answer:
          'Yes, any AI system can. We define what an AI feature should and should not do, base it on approved documents or data where that fits, and design it so people can review its output. We do not promise error-free results.',
      },
      {
        question: 'How is a project priced?',
        answer:
          'Around your actual requirements. Once we understand what you need, we propose a scope, timeline and cost. Work outside that scope is discussed separately. We do not sell fixed packages or publish generic prices.',
      },
      {
        question: 'Do you build mobile apps?',
        answer:
          'Yes. Custom mobile apps for customers, teams and communities are part of what we offer, connected to web platforms and backend systems.',
      },
      {
        question: 'Who will I work with?',
        answer:
          'DORVANTECH is founder-led, so you talk directly with the person building your project.',
      },
    ] as FaqItem[],
  },
  contact: {
    heading: "Have an idea? Let's build it.",
    lead: 'Tell us what you are trying to achieve. You do not need technical terms. We will reply by email with questions or next steps.',
    steps: [
      'We read your message and reply with any questions.',
      'We talk through your requirements and what you want to achieve.',
      'If it is a fit, we prepare a scope, timeline and cost for you to review.',
    ],
    chips: [
      { label: 'Website or online store', value: 'website' },
      { label: 'Custom software', value: 'custom-software' },
      { label: 'AI agent or RAG system', value: 'ai' },
      { label: 'Mobile app', value: 'mobile' },
      { label: 'Dashboard, portal or CMS', value: 'dashboard-cms' },
      { label: 'Integrations or automation', value: 'integrations' },
      { label: 'Ongoing management', value: 'management' },
      { label: 'Not sure yet', value: 'unsure' },
    ],
  },
};
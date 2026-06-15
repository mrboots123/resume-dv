// Single source of truth for the resume. Everything (timeline, map markers,
// the animated path) is derived from `resume` below — no duplicated data.

export interface ContactLink {
  label: string
  href: string
  /** Shown to the user; href stays clean for copy/paste. */
  display: string
  /** Icon key resolved in components/icons.ts */
  icon: 'github' | 'email' | 'phone' | 'linkedin'
}

export interface Job {
  id: string
  company: string
  role: string
  /** Display string, e.g. "2022 – 2025" */
  period: string
  /** Sort key — earlier first. Year the role started. */
  startYear: number
  city: string
  /** [lat, lng] of the office. */
  coords: [number, number]
  /** Bold anchor line — a named project/product/client, ideally. */
  headline: string
  /** 2–3 concrete deliverables — "what I built", short phrases, tech named inline. */
  bullets: string[]
  /** Optional short scope tags, e.g. "Tech Lead", "Team of 4". */
  scope?: string[]
  /** Tech keys resolved in components/icons.ts */
  stack: string[]
  /** 2–3 defining tech keys (subset of `stack`) that get emphasized chips. */
  heroStack?: string[]
  /** Optional self-aware aside — lets the site point at itself as the proof
   *  (e.g. the LightBox map IS the journey map you're scrolling). Rendered as
   *  a quiet callout on the card, not a deliverable. */
  selfRef?: string
  /** Files in /public/assets */
  logo: string
}

export interface EducationItem {
  /** Stable id — used for the scroll anchor and map marker, like Job.id. */
  id: string
  school: string
  degree: string
  detail: string
  year: string
  city: string
  /** [lat, lng] of the campus — places it as a node on the journey map. */
  coords: [number, number]
  logo: string
}

/**
 * A node on the journey map. Jobs and the alma mater are rendered as the same
 * kind of thing on the map (a marker + a point on the animated path) but as
 * different cards in the timeline — the `kind` tag discriminates the two.
 */
export type Stop =
  | ({ kind: 'job' } & Job)
  | ({ kind: 'education' } & EducationItem)

export interface SkillGroup {
  category: string
  items: string[]
}

export interface Resume {
  name: string
  title: string
  tagline: string
  /** Muted one-liner under the hook: years + domains for instant credibility.
   *  Supports {years} (filled from the ASU grad year so it never goes stale). */
  experienceLine: string
  /** Defining technologies, shown as a one-line summary in the hero. */
  coreStack: string[]
  location: string
  contacts: ContactLink[]
  /** Stored oldest → newest so scrolling = moving forward through the career. */
  jobs: Job[]
  skills: SkillGroup[]
  education: EducationItem[]
}

export const resume: Resume = {
  name: 'Diego Vazquez',
  title: 'Senior Software Engineer',
  // The hook: lead with the benefit (optimization, in recruiter-readable words),
  // and the live experience itself is the proof. "front-end at heart" keeps the
  // performance/craft pitch while the title stays full-stack/software.
  tagline: 'I make web apps feel instant. Full-stack engineer, front-end at heart.',
  experienceLine: 'From American Express card platforms to LightBox’s mapping engine — {years} years across the stack.',
  coreStack: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Java'],
  location: 'Phoenix, AZ · Open to remote',
  contacts: [
    { label: 'Email', href: 'mailto:vazquez.diego59@gmail.com', display: 'vazquez.diego59@gmail.com', icon: 'email' },
    { label: 'GitHub', href: 'https://github.com/mrboots123', display: 'GitHub', icon: 'github' },
    {
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/diego-vazquez-81b60211a/',
      display: 'linkedin.com/in/diego-vazquez',
      icon: 'linkedin',
    },
    { label: 'Phone', href: 'tel:+16023171162', display: '+1 (602) 317-1162', icon: 'phone' },
  ],
  jobs: [
    {
      id: 'syntel',
      company: 'Syntel',
      role: 'Full Stack Engineer',
      period: '2016 – 2018',
      startYear: 2016,
      city: 'Phoenix, AZ',
      coords: [33.605278033951684, -112.1186636853258],
      headline: 'American Express merchant portal',
      bullets: [
        'Built and maintained front-end components in React, converting wireframes into features integrated into the One App ecosystem.',
        'Developed and maintained Java / Spring Boot services behind the merchant portal, exposing REST APIs consumed by the React front end.',
        'Shipped through a Jenkins CI/CD pipeline onto Red Hat infrastructure.',
      ],
      scope: [],
      stack: ['react', 'jenkins', 'redhat', 'java', 'spring'],
      // heroStack = the 2–3 defining techs for this role; reorder/swap to taste.
      heroStack: ['react', 'jenkins', 'redhat'],
      logo: 'syntel.png',
    },
    {
      id: 'das',
      company: 'Digital AirStrike',
      role: 'Front End Engineer',
      period: '2018 – 2019',
      startYear: 2018,
      city: 'Scottsdale, AZ',
      coords: [33.50264344162594, -111.9320805748817],
      headline: 'Flagship analytics application', // TODO: replace with a real named project/metric
      bullets: [
        'Built the responsive React UI on a .NET (C#) backend for the analyst-facing application.',
        'Implemented authentication and authorization with Auth0, gating analyst access to sensitive client data.',
        'Delivered features on Azure-hosted services and migrated the UI to TypeScript.',
      ],
      scope: [],
      stack: ['react', 'bootstrap', 'azure', 'csharp', 'auth0', 'typescript'],
      heroStack: ['react', 'bootstrap', 'azure'],
      logo: 'dalogo.png',
    },
    {
      id: 'amex',
      company: 'American Express',
      role: 'Full Stack Engineer',
      period: '2019 – 2022',
      startYear: 2019,
      city: 'Scottsdale, AZ',
      coords: [33.659248, -111.961511],
      headline: 'David Jones Australian Card team',
      bullets: [
        'Built and managed card offers inside the One App ecosystem, converting wireframes into production React + TypeScript applications.',
        'Developed Node.js services and integrations powering card-offer experiences for Australian cardmembers.',
        'Automated build, test, and deployment with Jenkins, keeping releases consistent across the card platform.',
      ],
      scope: [],
      stack: ['react', 'jenkins', 'node', 'typescript'],
      heroStack: ['react', 'jenkins', 'node'],
      logo: 'American-Express-Color.png',
    },
    {
      id: 'carvana',
      company: 'Carvana',
      role: 'Full Stack Engineer',
      period: '2022',
      startYear: 2022,
      city: 'Tempe, AZ',
      coords: [33.43064858511423, -111.93398957396742],
      headline: 'Carvana Design Language System (DLS)',
      bullets: [
        'Created internal React applications for collision repair centers.',
        'Built reusable React components integrated into the Design Language System (DLS).',
        'Backed the tools with Node.js and MongoDB services modeling repair-center workflows and data.',
      ],
      scope: [],
      stack: ['react', 'bootstrap', 'node', 'typescript', 'mongodb'],
      heroStack: ['react', 'bootstrap', 'node'],
      logo: 'carvana.png',
    },
    {
      id: 'lightbox',
      company: 'LightBox',
      role: 'Senior Software Engineer',
      period: '2022 – 2025',
      startYear: 2022.5,
      city: 'New York, NY',
      coords: [40.75487784334869, -73.98646902886887],
      headline: 'Interactive geospatial maps', // TODO: name the real product/client
      bullets: [
        'Built the Leaflet mapping layer in React for exploring large geospatial datasets.',
        'Designed PostgreSQL-backed Node.js services to query large geospatial datasets.',
        'Built the responsive, accessible map interface with Tailwind and TypeScript.',
      ],
      scope: [],
      stack: ['react', 'tailwind', 'leaflet', 'node', 'typescript', 'postgres'],
      heroStack: ['react', 'tailwind', 'leaflet'],
      // Honest nod: this site's map shares the React + Leaflet craft from this
      // role — without claiming it IS the LightBox product.
      selfRef: 'Same React + Leaflet craft behind the map you’re scrolling.',
      logo: 'lightbox.png',
    },
    {
      id: 'plexus',
      company: 'Plexus Worldwide',
      role: 'Senior Software Engineer',
      period: '2025 – Present',
      startYear: 2025,
      city: 'Scottsdale, AZ',
      // Plexus Worldwide HQ, Scottsdale — back in the Phoenix metro.
      coords: [33.55862, -111.88873],
      headline: 'plexusworldwide.com — storefront, cart & checkout',
      bullets: [
        'Build the main Plexus storefront in Next.js, React, and TypeScript, turning designs into production pages backed by Contentful-managed content.',
        'Maintain and enhance the legacy cart and checkout, fixing bugs and shipping new functionality that keeps the purchase path solid for a global customer base.',
        'Power site search and content delivery with Node.js services over OpenSearch and MongoDB.',
      ],
      scope: [],
      stack: ['nextjs', 'react', 'typescript', 'node', 'contentful', 'opensearch', 'mongodb'],
      heroStack: ['nextjs', 'react', 'contentful'],
      logo: 'plexus.svg', // placeholder wordmark — swap for the real logo
    },
  ],
  skills: [
    { category: 'Languages', items: ['TypeScript', 'JavaScript', 'Java', 'C#', 'SQL'] },
    { category: 'Frontend', items: ['React', 'Leaflet', 'Tailwind', 'Bootstrap'] },
    { category: 'Backend', items: ['Node.js', 'Spring Boot', 'PostgreSQL', 'MongoDB'] },
    { category: 'Platform', items: ['Azure', 'Jenkins', 'Red Hat', 'Auth0'] },
  ],
  education: [
    {
      id: 'asu',
      school: 'Arizona State University',
      degree: 'B.S. in Computer Science',
      detail: 'Bachelor of Science',
      year: '2016',
      city: 'Tempe, AZ',
      // ASU Tempe campus — the journey's origin, in the Phoenix metro.
      coords: [33.4242, -111.9281],
      logo: 'asu-logo.png',
    },
  ],
}

/**
 * Every node the journey map renders, oldest → newest: the alma mater as the
 * ORIGIN, then each job. The map path, its markers, and the scroll anchors are
 * all derived from this one array (App reverses it for the reverse-chron
 * timeline), so they stay perfectly in sync — same single-source-of-truth rule
 * as `resume.jobs`. Education precedes jobs because graduation came first.
 */
export const stops: Stop[] = [
  ...resume.education.map((e) => ({ kind: 'education' as const, ...e })),
  ...resume.jobs.map((j) => ({ kind: 'job' as const, ...j })),
]

/** Asset URL helper so components don't repeat the base path. */
export const asset = (file: string) => `${import.meta.env.BASE_URL}assets/${file}`

/**
 * Years of experience, counted from the ASU graduation year to the current
 * year — so the hero never goes stale. Falls back to the first education entry.
 */
export function yearsOfExperience(now: Date = new Date()): number {
  const grad =
    resume.education.find((e) => e.school.includes('Arizona State'))?.year ?? resume.education[0]?.year
  return now.getFullYear() - Number(grad)
}

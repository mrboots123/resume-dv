import type { IconType } from 'react-icons'
import { FaBootstrap, FaGithub, FaJava, FaJenkins, FaLinkedin, FaNodeJs, FaReact, FaRedhat } from 'react-icons/fa'
import { MdEmail } from 'react-icons/md'
import { BsFillTelephoneFill } from 'react-icons/bs'
import { RiTailwindCssFill } from 'react-icons/ri'
import { SiAuth0, SiContentful, SiLeaflet, SiMongodb, SiNextdotjs, SiOpensearch, SiPostgresql, SiTypescript } from 'react-icons/si'
import { VscAzure } from 'react-icons/vsc'
import { TbBrandCSharp } from 'react-icons/tb'
import { BiLogoSpringBoot } from 'react-icons/bi'

/** Tech category buckets. Order here is the chip-group render order. */
export type TechCategory = 'Frontend' | 'Backend' | 'Data' | 'Cloud' | 'Tooling'

/** Order in which category groups are rendered on the card. */
export const CATEGORY_ORDER: TechCategory[] = ['Frontend', 'Backend', 'Data', 'Cloud', 'Tooling']

/** tech key -> { Icon, label, category } used by stack chips. */
export const TECH: Record<string, { Icon: IconType; label: string; category: TechCategory }> = {
  react: { Icon: FaReact, label: 'React', category: 'Frontend' },
  nextjs: { Icon: SiNextdotjs, label: 'Next.js', category: 'Frontend' },
  typescript: { Icon: SiTypescript, label: 'TypeScript', category: 'Frontend' },
  node: { Icon: FaNodeJs, label: 'Node.js', category: 'Backend' },
  tailwind: { Icon: RiTailwindCssFill, label: 'Tailwind', category: 'Frontend' },
  leaflet: { Icon: SiLeaflet, label: 'Leaflet', category: 'Frontend' },
  postgres: { Icon: SiPostgresql, label: 'PostgreSQL', category: 'Data' },
  mongodb: { Icon: SiMongodb, label: 'MongoDB', category: 'Data' },
  opensearch: { Icon: SiOpensearch, label: 'OpenSearch', category: 'Data' },
  contentful: { Icon: SiContentful, label: 'Contentful', category: 'Backend' },
  bootstrap: { Icon: FaBootstrap, label: 'Bootstrap', category: 'Frontend' },
  jenkins: { Icon: FaJenkins, label: 'Jenkins', category: 'Tooling' },
  redhat: { Icon: FaRedhat, label: 'Red Hat', category: 'Cloud' },
  java: { Icon: FaJava, label: 'Java', category: 'Backend' },
  spring: { Icon: BiLogoSpringBoot, label: 'Spring Boot', category: 'Backend' },
  azure: { Icon: VscAzure, label: 'Azure', category: 'Cloud' },
  csharp: { Icon: TbBrandCSharp, label: 'C#', category: 'Backend' },
  auth0: { Icon: SiAuth0, label: 'Auth0', category: 'Tooling' },
}

/** contact icon key -> Icon */
export const CONTACT_ICON: Record<string, IconType> = {
  github: FaGithub,
  email: MdEmail,
  phone: BsFillTelephoneFill,
  linkedin: FaLinkedin,
}

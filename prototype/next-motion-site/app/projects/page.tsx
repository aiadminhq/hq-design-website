import { ProjectsBrowser } from "../../components/projects-browser";
import { projects } from "../../lib/projects";

export default function ProjectsPage() {
  return <main className="projects-page page-width"><section className="page-intro"><p className="eyebrow">Selected work</p><h1>Projects that make space meaningful.</h1><p>Commercial interiors, workplace systems, hospitality and design studies by HQ Design.</p></section><ProjectsBrowser projects={projects} /></main>;
}

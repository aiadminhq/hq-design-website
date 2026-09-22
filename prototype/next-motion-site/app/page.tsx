import { ProjectMosaic } from "../components/project-mosaic";
import { projects } from "../lib/projects";

export default function HomePage() {
  return <main><ProjectMosaic projects={projects} /><section id="process" className="process-band page-width"><p className="eyebrow">AI × Design × Delivery</p><h1>From spatial intent to built intelligence.</h1><p>HQ Design combines interior architecture, computational thinking and delivery discipline to make complex spaces clear, useful and memorable.</p></section></main>;
}

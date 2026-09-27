import { notFound } from "next/navigation";
import { ProjectDetail } from "../../../components/project-detail";
import { getProject, projects } from "../../../lib/projects";

export function generateStaticParams() { return projects.map((project) => ({ slug: project.slug })); }

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  return <ProjectDetail project={project} />;
}

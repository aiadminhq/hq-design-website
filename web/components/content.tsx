import parse, {
  domToReact,
  attributesToProps,
  Element,
  type DOMNode,
  type HTMLReactParserOptions,
} from "html-react-parser";
import Link from "next/link";
import { Reveal } from "./motion";
import { FeaturedProjects, ProjectsBrowser } from "./projects-browser";
import type { Project, Locale } from "../lib/project";

/** Only accepts build-time, checked-in main HTML. Notion text is rendered separately as React text. */
export function Content({
  html,
  projects = [],
  locale,
}: {
  html: string;
  projects?: Project[];
  locale: Locale;
}) {
  const options: HTMLReactParserOptions = {
    replace(node) {
      if (!(node instanceof Element)) return;
      if (node.name === "script") return <></>;
      if (node.attribs["data-component"] === "featured-projects")
        return <FeaturedProjects projects={projects} locale={locale} />;
      if (node.attribs["data-component"] === "projects-browser")
        return <ProjectsBrowser projects={projects} locale={locale} />;
      const children = () => domToReact(node.children as DOMNode[], options);
      if (node.name === "a" && node.attribs.href?.startsWith("/"))
        return (
          <Link {...attributesToProps(node.attribs)} href={node.attribs.href}>
            {children()}
          </Link>
        );
      if (
        node.name === "div" &&
        /(?:^| )(?:why-card|service-card|career-card)(?: |$)/.test(
          node.attribs.class || "",
        )
      )
        return <Reveal className={node.attribs.class}>{children()}</Reveal>;
      if (node.name === "section" && node.attribs.class === "cta-banner")
        return <CallToAction>{children()}</CallToAction>;
    },
  };
  return <>{parse(html, options)}</>;
}
export function CallToAction({ children }: { children: React.ReactNode }) {
  return <section className="cta-banner">{children}</section>;
}

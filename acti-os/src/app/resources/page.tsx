import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/site/site-chrome";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { buttonVariants } from "@/components/ui/button";
import { getAllBlogPosts } from "@/lib/content/blog-posts";
import { cn } from "@/lib/utils";
import { ArrowRight, BookOpen } from "lucide-react";

export const metadata = { title: "Academic Resources" };

export default function ResourcesPage() {
  const posts = getAllBlogPosts();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader variant="solid" />
      <PageHero
        eyebrow="Academic Resources"
        title="Insights for learners and applicants"
        description="Guides on admissions, programmes, fees, and ACTI’s learn–build–innovate approach."
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Resources" },
        ]}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-14 sm:px-6">
        <Reveal>
          <div className="mb-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-brand-teal/20 bg-brand-teal/5 p-5">
            <div className="flex gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-brand-teal/15 text-brand-teal">
                <BookOpen className="size-5" />
              </div>
              <div>
                <p className="font-display font-semibold text-primary">
                  Student E-Library
                </p>
                <p className="text-sm text-muted-foreground">
                  Enrolled students can access curated e-books, handouts, and
                  guides in the portal.
                </p>
              </div>
            </div>
            <Link
              href="/login?next=/student/library"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Open E-Library
            </Link>
          </div>
        </Reveal>

        <div className="grid gap-5 md:grid-cols-2">
          {posts.map((post, index) => (
            <Reveal key={post.slug} delayMs={index * 50}>
              <article className="group flex h-full flex-col rounded-2xl border border-border/80 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-brand-blue/30 hover:shadow-md">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="rounded-md bg-brand-blue/10 px-2 py-1 font-semibold uppercase tracking-wider text-brand-blue">
                    {post.category}
                  </span>
                  <span className="text-muted-foreground">
                    {post.readingMinutes} min read
                  </span>
                </div>
                <h2 className="mt-4 font-display text-xl font-semibold text-primary group-hover:text-brand-blue">
                  <Link href={`/resources/${post.slug}`}>{post.title}</Link>
                </h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {post.excerpt}
                </p>
                <div className="mt-5 flex items-center justify-between gap-3">
                  <p className="text-xs text-muted-foreground">
                    {new Date(post.publishedAt).toLocaleDateString("en-NG", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    · {post.author}
                  </p>
                  <Link
                    href={`/resources/${post.slug}`}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-primary"
                  >
                    Read
                    <ArrowRight className="size-3.5 transition group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

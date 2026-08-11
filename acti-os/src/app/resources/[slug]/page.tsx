import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter, SiteHeader } from "@/components/site/site-chrome";
import { PageHero } from "@/components/site/page-hero";
import { buttonVariants } from "@/components/ui/button";
import { getAllBlogPosts, getBlogPost } from "@/lib/content/blog-posts";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return getAllBlogPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  return {
    title: post?.title ?? "Resource",
    description: post?.excerpt,
  };
}

export default async function ResourceArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const related = getAllBlogPosts()
    .filter((p) => p.slug !== post.slug)
    .slice(0, 3);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader variant="solid" />
      <PageHero
        eyebrow={post.category}
        title={post.title}
        description={`${post.readingMinutes} min read · ${post.author}`}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Resources", href: "/resources" },
          { label: post.title },
        ]}
      />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-14 sm:px-6">
        <p className="text-sm text-muted-foreground">
          Published{" "}
          {new Date(post.publishedAt).toLocaleDateString("en-NG", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
        <div className="mt-8 space-y-5 text-base leading-relaxed text-foreground/90">
          {post.body.map((paragraph) => (
            <p key={paragraph.slice(0, 32)}>{paragraph}</p>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link href="/resources" className={cn(buttonVariants({ variant: "outline" }))}>
            All resources
          </Link>
          <Link href="/admissions" className={cn(buttonVariants())}>
            Admissions
          </Link>
        </div>

        {related.length > 0 && (
          <section className="mt-16 border-t pt-10">
            <h2 className="font-display text-2xl font-bold text-primary">
              More resources
            </h2>
            <ul className="mt-5 space-y-3">
              {related.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/resources/${item.slug}`}
                    className="font-medium text-brand-blue hover:underline"
                  >
                    {item.title}
                  </Link>
                  <p className="text-sm text-muted-foreground">{item.excerpt}</p>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

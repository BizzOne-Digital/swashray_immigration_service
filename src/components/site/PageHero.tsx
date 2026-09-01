import { Container } from "@/components/ui/Container";

export function PageHero({ eyebrow, heading, intro }: { eyebrow?: string; heading: string; intro?: string }) {
  return (
    <section className="bg-[var(--color-primary)] text-white">
      <Container className="py-16 sm:py-20">
        <div className="max-w-2xl animate-fade-in-up">
          {eyebrow && (
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--color-accent)] mb-4">
              {eyebrow}
            </p>
          )}
          <h1 className="font-heading text-4xl sm:text-5xl font-semibold tracking-tight">{heading}</h1>
          {intro && <p className="mt-5 text-white/75 leading-relaxed text-lg">{intro}</p>}
        </div>
      </Container>
    </section>
  );
}

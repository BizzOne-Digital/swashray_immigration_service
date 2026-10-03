"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";

export function PageHero({ eyebrow, heading, intro }: { eyebrow?: string; heading: string; intro?: string }) {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(135deg,var(--color-dark)_0%,var(--color-secondary)_55%,var(--color-primary)_100%)] text-white">
      {/* subtle premium texture: soft radial glow, kept behind all content */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(60% 90% at 85% 0%, rgba(212,175,55,0.12) 0%, transparent 60%), radial-gradient(40% 60% at 0% 100%, rgba(181,18,27,0.10) 0%, transparent 65%)",
        }}
        aria-hidden="true"
      />
      <Container className="relative py-16 sm:py-20">
        <div className="max-w-2xl">
          {eyebrow && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--color-accent)] mb-4"
            >
              {eyebrow}
            </motion.p>
          )}
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut", delay: 0.05 }}
            className="font-heading text-4xl sm:text-5xl font-semibold tracking-tight"
          >
            {heading}
          </motion.h1>
          <span className="heading-rule" aria-hidden="true" />
          {intro && (
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: "easeOut", delay: 0.15 }}
              className="mt-5 text-white/75 leading-relaxed text-lg"
            >
              {intro}
            </motion.p>
          )}
        </div>
      </Container>
    </section>
  );
}

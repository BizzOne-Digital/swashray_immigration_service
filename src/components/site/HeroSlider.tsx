"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { useTypewriter } from "@/components/site/useTypewriter";

export interface HeroSlide {
  _id?: string;
  label: string;
  heading: string;
  subheading: string;
  videoSrc?: string | null;
  ctaText: string;
  ctaUrl: string;
}

const AUTOPLAY_MS = 7000;

/**
 * Full-bleed cinematic homepage hero: an autoplaying video crossfade with a
 * continuously-looping typewriter heading, dark readability overlay, desktop
 * arrow controls, and dot pagination. Pauses on hover/focus and on
 * prefers-reduced-motion (where it shows a static brand-colored gradient
 * panel instead of video, no typing animation).
 *
 * Videos are preloaded eagerly on mount and only faded in once they can play
 * through without buffering — this prevents the dark/blue gradient flash
 * that used to show while videos were still loading.
 */
export function HeroSlider({
  slides,
  secondaryCtaText,
  secondaryCtaUrl,
}: {
  slides: HeroSlide[];
  secondaryCtaText?: string;
  secondaryCtaUrl?: string;
}) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [ready, setReady] = useState<Set<number>>(() => new Set());
  const [errored, setErrored] = useState<Set<number>>(() => new Set());
  const videoRefs = useRef<Record<number, HTMLVideoElement | null>>({});
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const count = slides.length;

  const goTo = useCallback((index: number) => {
    setActive(((index % count) + count) % count);
  }, [count]);

  // Play the active slide's video, pause every other mounted one.
  useEffect(() => {
    if (reducedMotion) return;
    Object.entries(videoRefs.current).forEach(([key, el]) => {
      if (!el) return;
      if (Number(key) === active) {
        el.currentTime = 0;
        el.play().catch(() => {});
      } else {
        el.pause();
      }
    });
  }, [active, reducedMotion]);

  useEffect(() => {
    if (count <= 1 || paused || reducedMotion) return;
    const id = setInterval(() => setActive((i) => (i + 1) % count), AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [count, paused, reducedMotion]);

  const markReady = useCallback((index: number) => {
    setReady((prev) => {
      if (prev.has(index)) return prev;
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  }, []);

  const markErrored = useCallback((index: number) => {
    setErrored((prev) => {
      if (prev.has(index)) return prev;
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  }, []);

  const slide = slides[Math.min(active, slides.length - 1)] ?? slides[0];
  const typewriter = useTypewriter(slide?.heading ?? "", { active: count > 0, enabled: !reducedMotion, loop: true, speed: 34 });

  if (count === 0 || !slide) return null;

  return (
    <section
      ref={sectionRef}
      className="relative isolate overflow-hidden min-h-[560px] h-[82vh] sm:h-[86vh] lg:h-[88vh] max-h-[860px] text-white bg-[var(--color-primary)]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Swashray Immigration Services highlights"
    >
      {/* Backgrounds */}
      <div className="absolute inset-0">
        {slides.map((s, i) => {
          const isActive = i === active;
          const isReady = ready.has(i);
          const hasErrored = errored.has(i);
          const showVideo = s.videoSrc && !reducedMotion && !hasErrored;
          return (
            <div
              key={s._id ?? i}
              aria-hidden={!isActive}
              className={cn(
                "absolute inset-0 transition-opacity duration-[1200ms] ease-in-out",
                isActive ? "opacity-100 z-[1]" : "opacity-0 z-0"
              )}
            >
              {showVideo ? (
                <>
                  <video
                    ref={(el) => {
                      videoRefs.current[i] = el;
                    }}
                    className={cn(
                      "absolute inset-0 h-full w-full object-cover",
                      isActive && isReady && "animate-kenburns"
                    )}
                    style={{ opacity: isReady ? 1 : 0, transition: "opacity 600ms ease" }}
                    muted
                    loop
                    playsInline
                    autoPlay={i === 0}
                    preload="auto"
                    aria-hidden="true"
                    tabIndex={-1}
                    disablePictureInPicture
                    onCanPlay={() => markReady(i)}
                    onCanPlayThrough={() => markReady(i)}
                    onError={() => markErrored(i)}
                  >
                    <source src={s.videoSrc ?? ""} type="video/mp4" />
                  </video>
                  {/* Dark branded fallback — shown until the video is ready, then hidden behind it.
                      Uses the same dark palette as the readability overlay so there's no color flash. */}
                  <div
                    className="absolute inset-0 bg-[linear-gradient(135deg,var(--color-dark)_0%,var(--color-secondary)_55%,var(--color-primary)_100%)]"
                    style={{ opacity: isReady ? 0 : 1, transition: "opacity 600ms ease" }}
                  />
                </>
              ) : (
                <div className="absolute inset-0 bg-[linear-gradient(135deg,var(--color-dark)_0%,var(--color-secondary)_55%,var(--color-primary)_100%)]" />
              )}
            </div>
          );
        })}
        {/* Readability overlay */}
        <div className="absolute inset-0 z-[2] bg-gradient-to-r from-black/75 via-black/45 to-black/20" />
        <div className="absolute inset-0 z-[2] bg-gradient-to-t from-black/70 via-transparent to-black/10" />
      </div>

      {/* Content */}
      <Container className="relative z-[3] flex h-full items-end sm:items-center pb-20 sm:pb-0">
        <div key={active} className="max-w-2xl min-w-0 animate-fade-in-up">
          {slide.label && (
            <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[var(--color-accent)] mb-5">
              {slide.label}
            </p>
          )}
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.08] min-h-[2.4em] sm:min-h-[2.2em] lg:min-h-[2.16em]">
            {typewriter.displayed.includes(" | ") ? (
              typewriter.displayed.split(" | ").map((part, i, arr) => (
                <span key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <>
                      {" "}
                      <span className="text-[var(--color-accent)]">|</span>{" "}
                    </>
                  )}
                </span>
              ))
            ) : (
              typewriter.displayed
            )}
            <span aria-hidden="true" className="inline-block w-[3px] h-[0.9em] align-middle bg-[var(--color-accent)] ml-1 animate-pulse" />
            <span className="sr-only">{slide.heading}</span>
          </h1>
          {slide.subheading && (
            <p className="mt-6 text-white/85 text-lg leading-relaxed max-w-xl">
              {slide.subheading}
            </p>
          )}
          <div className="mt-9 flex flex-wrap items-center gap-5">
            {slide.ctaText && slide.ctaUrl && (
              <ButtonLink href={slide.ctaUrl} variant="secondary" size="lg">
                {slide.ctaText}
              </ButtonLink>
            )}
            {secondaryCtaText && secondaryCtaUrl && (
              <ButtonLink
                href={secondaryCtaUrl}
                variant="ghost"
                size="lg"
                className="text-white hover:bg-white/10 gap-2"
              >
                {secondaryCtaText}
                <ArrowRight className="h-4 w-4" />
              </ButtonLink>
            )}
          </div>
        </div>
      </Container>

      {/* Arrow controls */}
      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => goTo(active - 1)}
            aria-label="Previous slide"
            className="hidden sm:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-[3] h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => goTo(active + 1)}
            aria-label="Next slide"
            className="hidden sm:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-[3] h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Pagination */}
      {count > 1 && (
        <div className="absolute bottom-6 sm:bottom-8 left-0 right-0 z-[3] flex justify-center gap-2.5">
          {slides.map((s, i) => (
            <button
              key={s._id ?? i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}: ${s.label || s.heading}`}
              aria-current={i === active}
              className={cn(
                "h-2 rounded-full transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]",
                i === active ? "w-7 bg-[var(--color-accent)]" : "w-2 bg-white/40 hover:bg-white/60"
              )}
            />
          ))}
        </div>
      )}
    </section>
  );
}

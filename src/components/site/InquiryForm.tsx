"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { toast } from "sonner";
import { inquirySchema } from "@/lib/validation";
import type { z } from "zod";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, Loader2 } from "lucide-react";

type FormValues = z.input<typeof inquirySchema>;

const inputClass =
  "w-full rounded-[var(--radius-btn)] border border-black/10 bg-white px-4 py-2.5 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-muted)]/60 focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/15 transition-all";
const labelClass = "block text-sm font-medium text-[var(--color-ink)] mb-1.5";
const errorClass = "text-xs text-red-600 mt-1";

export function InquiryForm({ services }: { services: { title: string }[] }) {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(inquirySchema) });

  async function onSubmit(values: FormValues) {
    try {
      const res = await fetch("/api/public/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      setSubmitted(true);
      reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-12 px-6 rounded-[var(--radius-card)] bg-[var(--color-primary)]/[0.04]">
        <CheckCircle2 className="h-10 w-10 text-[var(--color-primary)] mx-auto mb-4" />
        <h3 className="font-heading text-xl font-semibold text-[var(--color-primary)]">Thank you for reaching out</h3>
        <p className="mt-2 text-sm text-[var(--color-muted)] max-w-sm mx-auto">
          We&apos;ve received your inquiry and will get back to you as soon as possible.
        </p>
        <Button variant="outline" className="mt-6" onClick={() => setSubmitted(false)}>
          Send Another Inquiry
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {/* Honeypot field — hidden from real users, catches simple bots */}
      <input type="text" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" {...register("companyWebsite")} />

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className={labelClass} htmlFor="fullName">Full Name *</label>
          <input id="fullName" className={inputClass} {...register("fullName")} />
          {errors.fullName && <p className={errorClass}>{errors.fullName.message}</p>}
        </div>
        <div>
          <label className={labelClass} htmlFor="email">Email *</label>
          <input id="email" type="email" className={inputClass} {...register("email")} />
          {errors.email && <p className={errorClass}>{errors.email.message}</p>}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className={labelClass} htmlFor="phone">Phone</label>
          <input id="phone" className={inputClass} {...register("phone")} />
        </div>
        <div>
          <label className={labelClass} htmlFor="serviceOfInterest">Service of Interest</label>
          <select id="serviceOfInterest" className={inputClass} {...register("serviceOfInterest")}>
            <option value="">Select a service</option>
            {services.map((s) => (
              <option key={s.title} value={s.title}>{s.title}</option>
            ))}
            <option value="Other">Other / Not Sure</option>
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="preferredContactMethod">Preferred Contact Method</label>
        <select id="preferredContactMethod" className={inputClass} {...register("preferredContactMethod")}>
          <option value="Email">Email</option>
          <option value="Phone">Phone</option>
          <option value="Either">Either</option>
        </select>
      </div>

      <div>
        <label className={labelClass} htmlFor="message">Your Immigration Goal / Inquiry *</label>
        <textarea id="message" rows={5} className={inputClass} {...register("message")} />
        {errors.message && <p className={errorClass}>{errors.message.message}</p>}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto justify-center">
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        Send Inquiry
      </Button>
    </form>
  );
}

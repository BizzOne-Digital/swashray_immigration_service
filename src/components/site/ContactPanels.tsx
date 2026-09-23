"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { InquiryForm } from "@/components/site/InquiryForm";
import { ConsultationWizard } from "@/components/site/ConsultationWizard";

type ServiceOption = { title: string; _id: string };

export function ContactPanels({ services }: { services: ServiceOption[] }) {
  const [tab, setTab] = useState<"inquiry" | "booking">("inquiry");

  return (
    <div>
      <div role="tablist" aria-label="Contact options" className="flex gap-1 p-1 mb-6 rounded-full bg-black/[0.04] w-fit">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "inquiry"}
          onClick={() => setTab("inquiry")}
          className={cn(
            "px-5 py-2 rounded-full text-sm font-medium transition-colors",
            tab === "inquiry" ? "bg-[var(--color-surface)] text-[var(--color-primary)] shadow-sm" : "text-[var(--color-muted)]"
          )}
        >
          Send an Inquiry
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "booking"}
          onClick={() => setTab("booking")}
          className={cn(
            "px-5 py-2 rounded-full text-sm font-medium transition-colors",
            tab === "booking" ? "bg-[var(--color-surface)] text-[var(--color-primary)] shadow-sm" : "text-[var(--color-muted)]"
          )}
        >
          Book a Consultation
        </button>
      </div>

      {tab === "inquiry" ? (
        <InquiryForm services={services} />
      ) : (
        <ConsultationWizard services={services.map((s) => ({ _id: s._id, title: s.title }))} />
      )}
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { CheckCircle2, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

type ServiceOption = { _id: string; title: string };

const inputClass =
  "w-full rounded-[var(--radius-btn)] border border-black/10 bg-white px-4 py-2.5 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-muted)]/60 focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/15 transition-all";
const labelClass = "block text-sm font-medium text-[var(--color-ink)] mb-1.5";
const errorClass = "text-xs text-red-600 mt-1";

// A 4-step guided flow — Assessment, Booking, Agreement, Confirmation — in
// the spirit of a modern consultation-booking wizard. There is deliberately
// no Payment step: this practice has not provided a payment processor, so
// no payment collection is invented here.
const STEPS = ["Assessment", "Booking", "Agreement", "Confirmation"] as const;

interface WizardData {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  serviceId: string;
  message: string;
  preferredDate: string;
  preferredTime: string;
  preferredContactMethod: "Email" | "Phone" | "Either";
  agreed: boolean;
}

const EMPTY: WizardData = {
  fullName: "",
  email: "",
  phone: "",
  country: "",
  serviceId: "",
  message: "",
  preferredDate: "",
  preferredTime: "",
  preferredContactMethod: "Email",
  agreed: false,
};

function formatTimeLabel(time: string) {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${m.toString().padStart(2, "0")} ${period}`;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function ConsultationWizard({ services }: { services: ServiceOption[] }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<WizardData>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsMessage, setSlotsMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  // Honeypot — real visitors never touch this field.
  const [companyWebsite, setCompanyWebsite] = useState("");

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  useEffect(() => {
    if (!data.preferredDate) {
      setSlots([]);
      return;
    }
    setSlotsLoading(true);
    setSlotsMessage(null);
    fetch(`/api/public/availability?date=${data.preferredDate}`)
      .then((r) => r.json())
      .then((res) => {
        setSlots(res.slots || []);
        if (res.reason) setSlotsMessage(res.reason);
        else if ((res.slots || []).length === 0) setSlotsMessage("No time slots available on this date.");
        setData((d) => ({ ...d, preferredTime: "" }));
      })
      .catch(() => setSlotsMessage("Could not load availability. Please try another date."))
      .finally(() => setSlotsLoading(false));
  }, [data.preferredDate]);

  function set<K extends keyof WizardData>(key: K, value: WizardData[K]) {
    setData((d) => ({ ...d, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  }

  function validateStep(current: number): boolean {
    const next: Record<string, string> = {};
    if (current === 0) {
      if (data.fullName.trim().length < 2) next.fullName = "Please enter your full name.";
      if (!isValidEmail(data.email)) next.email = "Enter a valid email address.";
      if (data.phone.trim().length < 5) next.phone = "Please enter a valid phone number.";
      if (data.message.trim().length < 10) next.message = "Please share a few details about your immigration goal.";
    }
    if (current === 1) {
      if (!data.preferredDate) next.preferredDate = "Please choose a preferred date.";
      if (!data.preferredTime) next.preferredTime = "Please choose an available time.";
    }
    if (current === 2) {
      if (!data.agreed) next.agreed = "Please confirm before submitting your request.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function goNext() {
    if (!validateStep(step)) return;
    if (step === 2) {
      void handleSubmit();
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const service = services.find((s) => s._id === data.serviceId);
      const res = await fetch("/api/public/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          country: data.country,
          serviceId: data.serviceId,
          serviceName: service?.title || "",
          preferredDate: data.preferredDate,
          preferredTime: data.preferredTime,
          preferredContactMethod: data.preferredContactMethod,
          message: data.message,
          agreedToConsultationTerms: data.agreed,
          companyWebsite,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Something went wrong. Please try again.");
      setSubmitted(true);
      setStep(3);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      // If the slot was taken between selection and submit, send them back
      // to the booking step so they can pick another time.
      if (err instanceof Error && err.message.toLowerCase().includes("time slot")) {
        setStep(1);
      }
    } finally {
      setSubmitting(false);
    }
  }

  function startOver() {
    setData(EMPTY);
    setErrors({});
    setSlots([]);
    setSubmitted(false);
    setStep(0);
  }

  return (
    <div className="rounded-[var(--radius-card)] border border-black/[0.06] bg-[var(--color-surface)]">
      {/* Step indicator */}
      <div className="flex items-center gap-2 px-6 pt-6 sm:px-8 sm:pt-8">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors",
                  i < step || submitted
                    ? "bg-[var(--color-primary)] text-white"
                    : i === step
                      ? "bg-[var(--color-accent)] text-[var(--color-primary)]"
                      : "bg-black/5 text-[var(--color-muted)]"
                )}
              >
                {i < step || (i === 3 && submitted) ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
              </div>
              <span className="hidden sm:block text-[11px] font-medium text-[var(--color-muted)] whitespace-nowrap">
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn("h-px flex-1 mx-2", i < step ? "bg-[var(--color-primary)]" : "bg-black/10")} />
            )}
          </div>
        ))}
      </div>

      <div className="p-6 sm:p-8">
        {step === 0 && (
          <div className="space-y-5">
            <div>
              <h3 className="font-heading text-lg font-semibold text-[var(--color-primary)]">Tell us about yourself</h3>
              <p className="text-sm text-[var(--color-muted)] mt-1">
                A quick assessment so we can prepare for your consultation.
              </p>
            </div>
            {/* Honeypot field, hidden from real users */}
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
              aria-hidden="true"
              value={companyWebsite}
              onChange={(e) => setCompanyWebsite(e.target.value)}
            />
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass} htmlFor="w-fullName">Full Name *</label>
                <input id="w-fullName" className={inputClass} value={data.fullName} onChange={(e) => set("fullName", e.target.value)} />
                {errors.fullName && <p className={errorClass}>{errors.fullName}</p>}
              </div>
              <div>
                <label className={labelClass} htmlFor="w-email">Email *</label>
                <input id="w-email" type="email" className={inputClass} value={data.email} onChange={(e) => set("email", e.target.value)} />
                {errors.email && <p className={errorClass}>{errors.email}</p>}
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass} htmlFor="w-phone">Phone *</label>
                <input id="w-phone" className={inputClass} value={data.phone} onChange={(e) => set("phone", e.target.value)} />
                {errors.phone && <p className={errorClass}>{errors.phone}</p>}
              </div>
              <div>
                <label className={labelClass} htmlFor="w-country">Country of Residence</label>
                <input
                  id="w-country"
                  className={inputClass}
                  placeholder="e.g. India, Philippines, Nigeria…"
                  value={data.country}
                  onChange={(e) => set("country", e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className={labelClass} htmlFor="w-service">Service of Interest</label>
              <select id="w-service" className={inputClass} value={data.serviceId} onChange={(e) => set("serviceId", e.target.value)}>
                <option value="">Select a service</option>
                {services.map((s) => (
                  <option key={s._id} value={s._id}>{s.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="w-message">Immigration Goal / Background *</label>
              <textarea
                id="w-message"
                rows={4}
                className={inputClass}
                placeholder="Tell us briefly about your immigration goal and background."
                value={data.message}
                onChange={(e) => set("message", e.target.value)}
              />
              {errors.message && <p className={errorClass}>{errors.message}</p>}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h3 className="font-heading text-lg font-semibold text-[var(--color-primary)]">Choose a date &amp; time</h3>
              <p className="text-sm text-[var(--color-muted)] mt-1">Pick a slot that works for you — availability updates in real time.</p>
            </div>
            <div>
              <label className={labelClass} htmlFor="w-date">Preferred Date *</label>
              <input
                id="w-date"
                type="date"
                min={todayStr}
                className={inputClass}
                value={data.preferredDate}
                onChange={(e) => set("preferredDate", e.target.value)}
              />
              {errors.preferredDate && <p className={errorClass}>{errors.preferredDate}</p>}
            </div>
            <div>
              <label className={labelClass}>Preferred Time *</label>
              {!data.preferredDate ? (
                <p className="text-sm text-[var(--color-muted)] py-2.5">Choose a date first</p>
              ) : slotsLoading ? (
                <p className="text-sm text-[var(--color-muted)] py-2.5 flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Checking availability…
                </p>
              ) : slots.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {slots.map((slot) => (
                    <button
                      type="button"
                      key={slot}
                      onClick={() => set("preferredTime", slot)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                        data.preferredTime === slot
                          ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                          : "border-black/10 text-[var(--color-ink)] hover:border-[var(--color-primary)]/40"
                      )}
                    >
                      {formatTimeLabel(slot)}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[var(--color-muted)] py-2.5">{slotsMessage}</p>
              )}
              {errors.preferredTime && <p className={errorClass}>{errors.preferredTime}</p>}
            </div>
            <div>
              <label className={labelClass} htmlFor="w-contact">Preferred Contact Method</label>
              <select
                id="w-contact"
                className={inputClass}
                value={data.preferredContactMethod}
                onChange={(e) => set("preferredContactMethod", e.target.value as WizardData["preferredContactMethod"])}
              >
                <option value="Email">Email</option>
                <option value="Phone">Phone</option>
                <option value="Either">Either</option>
              </select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h3 className="font-heading text-lg font-semibold text-[var(--color-primary)]">Review &amp; confirm</h3>
              <p className="text-sm text-[var(--color-muted)] mt-1">Please review your details before submitting your request.</p>
            </div>
            <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm rounded-[var(--radius-btn)] bg-[var(--color-primary)]/[0.03] p-5">
              <div><dt className="text-[var(--color-muted)]">Name</dt><dd className="text-[var(--color-ink)] font-medium">{data.fullName}</dd></div>
              <div><dt className="text-[var(--color-muted)]">Email</dt><dd className="text-[var(--color-ink)] font-medium">{data.email}</dd></div>
              <div><dt className="text-[var(--color-muted)]">Phone</dt><dd className="text-[var(--color-ink)] font-medium">{data.phone}</dd></div>
              {data.country && <div><dt className="text-[var(--color-muted)]">Country</dt><dd className="text-[var(--color-ink)] font-medium">{data.country}</dd></div>}
              <div><dt className="text-[var(--color-muted)]">Date</dt><dd className="text-[var(--color-ink)] font-medium">{data.preferredDate}</dd></div>
              <div><dt className="text-[var(--color-muted)]">Time</dt><dd className="text-[var(--color-ink)] font-medium">{data.preferredTime && formatTimeLabel(data.preferredTime)}</dd></div>
            </dl>
            <label className="flex items-start gap-3 text-sm text-[var(--color-ink)] cursor-pointer">
              <input
                type="checkbox"
                checked={data.agreed}
                onChange={(e) => set("agreed", e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-black/20 text-[var(--color-primary)] focus:ring-[var(--color-accent)]"
              />
              <span>
                I understand this request books a preliminary consultation only, and that no immigration advice is
                given until I speak with a licensed consultant. This is not a payment or a guarantee of any
                immigration outcome.
              </span>
            </label>
            {errors.agreed && <p className={errorClass}>{errors.agreed}</p>}
          </div>
        )}

        {step === 3 && submitted && (
          <div className="text-center py-8">
            <CheckCircle2 className="h-12 w-12 text-[var(--color-primary)] mx-auto mb-4" />
            <h3 className="font-heading text-xl font-semibold text-[var(--color-primary)]">Consultation Requested</h3>
            <p className="mt-2 text-sm text-[var(--color-muted)] max-w-sm mx-auto">
              We&apos;ve received your request for {data.preferredDate} at {formatTimeLabel(data.preferredTime)} and
              will confirm your appointment shortly by {data.preferredContactMethod.toLowerCase()}.
            </p>
            <Button variant="outline" className="mt-6" onClick={startOver}>
              Book Another Consultation
            </Button>
          </div>
        )}

        {step < 3 && (
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-black/5">
            <Button variant="ghost" onClick={goBack} disabled={step === 0} className={step === 0 ? "invisible" : ""}>
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>
            <Button onClick={goNext} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {step === 2 ? "Submit Request" : "Continue"}
              {step < 2 && <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

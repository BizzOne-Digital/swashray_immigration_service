"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { bookingSchema } from "@/lib/validation";
import type { z } from "zod";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

type FormValues = z.input<typeof bookingSchema>;
type ServiceOption = { _id: string; title: string };

const inputClass =
  "w-full rounded-[var(--radius-btn)] border border-black/10 bg-white px-4 py-2.5 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-muted)]/60 focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/15 transition-all";
const labelClass = "block text-sm font-medium text-[var(--color-ink)] mb-1.5";
const errorClass = "text-xs text-red-600 mt-1";

function formatTimeLabel(time: string) {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${m.toString().padStart(2, "0")} ${period}`;
}

export function BookingForm({ services }: { services: ServiceOption[] }) {
  const [submitted, setSubmitted] = useState(false);
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsMessage, setSlotsMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { preferredContactMethod: "Email" },
  });

  const selectedDate = watch("preferredDate");
  const selectedTime = watch("preferredTime");

  useEffect(() => {
    if (!selectedDate) {
      setSlots([]);
      return;
    }
    setSlotsLoading(true);
    setSlotsMessage(null);
    fetch(`/api/public/availability?date=${selectedDate}`)
      .then((r) => r.json())
      .then((data) => {
        setSlots(data.slots || []);
        if (data.reason) setSlotsMessage(data.reason);
        else if ((data.slots || []).length === 0) setSlotsMessage("No time slots available on this date.");
        setValue("preferredTime", "");
      })
      .catch(() => setSlotsMessage("Could not load availability. Please try another date."))
      .finally(() => setSlotsLoading(false));
  }, [selectedDate, setValue]);

  async function onSubmit(values: FormValues) {
    try {
      const service = services.find((s) => s._id === values.serviceId);
      const res = await fetch("/api/public/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, serviceName: service?.title || "" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      setSubmitted(true);
      reset();
      setSlots([]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-12 px-6 rounded-[var(--radius-card)] bg-[var(--color-primary)]/[0.04]">
        <CheckCircle2 className="h-10 w-10 text-[var(--color-primary)] mx-auto mb-4" />
        <h3 className="font-heading text-xl font-semibold text-[var(--color-primary)]">Consultation Requested</h3>
        <p className="mt-2 text-sm text-[var(--color-muted)] max-w-sm mx-auto">
          We&apos;ve received your request and will confirm your appointment shortly.
        </p>
        <Button variant="outline" className="mt-6" onClick={() => setSubmitted(false)}>
          Book Another Consultation
        </Button>
      </div>
    );
  }

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
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
          <label className={labelClass} htmlFor="phone">Phone *</label>
          <input id="phone" className={inputClass} {...register("phone")} />
          {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
        </div>
        <div>
          <label className={labelClass} htmlFor="serviceId">Service</label>
          <select id="serviceId" className={inputClass} {...register("serviceId")}>
            <option value="">Select a service</option>
            {services.map((s) => (
              <option key={s._id} value={s._id}>{s.title}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className={labelClass} htmlFor="preferredDate">Preferred Date *</label>
          <input id="preferredDate" type="date" min={todayStr} className={inputClass} {...register("preferredDate")} />
          {errors.preferredDate && <p className={errorClass}>{errors.preferredDate.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Preferred Time *</label>
          {!selectedDate ? (
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
                  onClick={() => setValue("preferredTime", slot, { shouldValidate: true })}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                    selectedTime === slot
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
          {errors.preferredTime && <p className={errorClass}>{errors.preferredTime.message}</p>}
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
        <label className={labelClass} htmlFor="message">Additional Message</label>
        <textarea id="message" rows={4} className={inputClass} {...register("message")} />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto justify-center">
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        Request Consultation
      </Button>
    </form>
  );
}

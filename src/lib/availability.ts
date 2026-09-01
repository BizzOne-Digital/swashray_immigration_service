import { connectDB } from "@/lib/db";
import Booking from "@/lib/models/Booking";
import { getBookingSettings } from "@/lib/cms";

const ACTIVE_STATUSES = new Set(["Pending", "Confirmed", "Reschedule Requested", "Completed"]);

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60)
    .toString()
    .padStart(2, "0");
  const m = (mins % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

/** Returns available HH:mm slot strings for a given YYYY-MM-DD date. */
export async function getAvailableSlots(dateStr: string): Promise<{ slots: string[]; reason?: string }> {
  const settings = await getBookingSettings();

  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return { slots: [], reason: "Invalid date." };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date < today) {
    return { slots: [], reason: "That date has already passed." };
  }

  if (settings.closedDates.includes(dateStr)) {
    return { slots: [], reason: "We're closed on this date." };
  }

  const dayOfWeek = date.getDay();
  if (!settings.workingDays.includes(dayOfWeek)) {
    return { slots: [], reason: "We're closed on this day of the week." };
  }

  await connectDB();
  const existing = await Booking.find({
    preferredDate: dateStr,
    status: { $in: Array.from(ACTIVE_STATUSES) },
  }).select("preferredTime");
  const takenTimes = new Set(existing.map((b) => b.preferredTime));

  const slots: string[] = [];
  const step = settings.appointmentDurationMinutes + settings.bufferMinutes;
  let cursor = timeToMinutes(settings.openTime);
  const end = timeToMinutes(settings.closeTime);

  const isToday = date.getTime() === today.getTime();
  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();

  while (cursor + settings.appointmentDurationMinutes <= end) {
    const slotTime = minutesToTime(cursor);
    const isPast = isToday && cursor <= nowMinutes;
    if (!takenTimes.has(slotTime) && !isPast) {
      slots.push(slotTime);
    }
    cursor += step;
  }

  return { slots };
}

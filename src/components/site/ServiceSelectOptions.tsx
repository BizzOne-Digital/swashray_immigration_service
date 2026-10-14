export type ServiceOption = { _id: string; title: string; group?: string };

/**
 * The <option>s for a "Service of Interest" <select>: services that carry a
 * `group` (their category) are listed under an <optgroup> per category, in
 * the order given; any ungrouped ones come first.
 */
export function ServiceSelectOptions({
  services,
  valueKey = "_id",
}: {
  services: ServiceOption[];
  /** Which field becomes each option's value. */
  valueKey?: "_id" | "title";
}) {
  const ungrouped = services.filter((s) => !s.group);
  const groups = new Map<string, ServiceOption[]>();
  for (const s of services) {
    if (!s.group) continue;
    groups.set(s.group, [...(groups.get(s.group) ?? []), s]);
  }

  return (
    <>
      {ungrouped.map((s) => (
        <option key={s._id} value={s[valueKey]}>
          {s.title}
        </option>
      ))}
      {[...groups].map(([group, items]) => (
        <optgroup key={group} label={group}>
          {items.map((s) => (
            <option key={s._id} value={s[valueKey]}>
              {s.title}
            </option>
          ))}
        </optgroup>
      ))}
    </>
  );
}

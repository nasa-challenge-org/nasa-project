import { FieldLabel, SelectInput } from "@/components/ui/field";
import { coordinateLabel } from "@/lib/format";
import type { LandingSite } from "@/lib/types";

export function SiteSelect({
  id,
  sites,
  value,
  onChange,
  disabled,
}: {
  id: string;
  sites: LandingSite[];
  value: string;
  onChange: (siteId: string) => void;
  disabled?: boolean;
}) {
  const selected = sites.find((site) => site.id === value);
  const options = sites.length ? sites : [{ id: value, name: value }];

  return (
    <div>
      <FieldLabel htmlFor={id}>Candidate site</FieldLabel>
      <SelectInput
        id={id}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((site) => (
          <option key={site.id} value={site.id}>
            {site.name}
          </option>
        ))}
      </SelectInput>
      <p className="mt-1 text-xs text-slate-500">
        {coordinateLabel(
          selected?.latitude_deg ?? null,
          selected?.longitude_east_deg ?? null,
        )}{" "}
        · verification: {selected?.verification_status ?? "unknown"}
        {selected?.gsfc_site_id ? ` · ${selected.gsfc_site_id}` : ""}
      </p>
    </div>
  );
}

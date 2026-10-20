import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Tag } from "@skryensya/react/tag";

const rowStyle = { display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--space-inline-sm)" } satisfies CSSProperties;

export function TagRemovableDemo({
  labels,
  groupLabel,
  removeLabel,
  emptyLabel,
}: {
  labels: string[];
  groupLabel: string;
  removeLabel: string;
  emptyLabel: string;
}) {
  const [filters, setFilters] = useState(labels);
  const groupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = groupRef.current?.closest(".sk-preview-card");
    const reset = () => setFilters(labels);
    card?.addEventListener("sk:preview-reload", reset);
    return () => card?.removeEventListener("sk:preview-reload", reset);
  }, [labels]);

  return (
    <div ref={groupRef} role="group" aria-label={groupLabel} style={rowStyle}>
      {filters.length
        ? filters.map((label) => (
            <Tag
              key={label}
              removable
              removeLabel={removeLabel.replace("{name}", label)}
              onRemove={() => setFilters((current) => current.filter((item) => item !== label))}
            >
              {label}
            </Tag>
          ))
        : <span>{emptyLabel}</span>}
    </div>
  );
}

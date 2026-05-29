import type { LucideIcon, LucideProps } from "lucide-react";
import {
  Warehouse,
  Truck,
  Boxes,
  Radar,
  Wine,
  Milk,
  Recycle,
  Package,
  HeartPulse,
  Container,
} from "lucide-react";

/**
 * Maps the registry icon names used in lib/modules.ts and lib/industries.ts
 * (kebab-case) to lucide-react icons. Keep this in sync with those registries.
 */
const ICONS: Record<string, LucideIcon> = {
  // modules
  warehouse: Warehouse,
  truck: Truck,
  boxes: Boxes,
  radar: Radar,
  // industries
  "bottle-wine": Wine,
  milk: Milk,
  recycle: Recycle,
  package: Package,
  "heart-pulse": HeartPulse,
  container: Container,
};

export function Icon({ name, ...props }: { name: string } & LucideProps) {
  const Glyph = ICONS[name];
  if (!Glyph) return null;
  return <Glyph aria-hidden strokeWidth={1.75} {...props} />;
}

import {
  BookOpen,
  Car,
  Clapperboard,
  Coffee,
  House,
  Package,
  Pill,
  ShoppingBag,
  Smartphone,
  Tag,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";

/** Категорияҳои система — иконка ба ҷои эмоҷи. */
const BY_KEY: Record<string, LucideIcon> = {
  food: UtensilsCrossed,
  transport: Car,
  cafe: Coffee,
  shopping: ShoppingBag,
  health: Pill,
  home: House,
  connection: Smartphone,
  fun: Clapperboard,
  education: BookOpen,
  other: Package,
};

/** Категорияи худсохт (аз AI) иконкаи умумӣ мегирад. */
export function categoryIcon(key: string): LucideIcon {
  return BY_KEY[key] ?? Tag;
}

import { categoryIcon } from "@/lib/icons";
import type { Category } from "@/lib/types";
import { cx } from "./ui";

/** Квадрати рангаи категория бо иконка. Ранг аз худи категория меояд,
 *  барои ҳамин ҳамон ранг дар графикҳо ва рӯйхат такрор мешавад. */
export function CategoryIcon({
  category,
  size = "md",
  className,
}: {
  category: Pick<Category, "key" | "color">;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const Icon = categoryIcon(category.key);
  const box = { sm: "size-7", md: "size-10", lg: "size-11" }[size];
  const glyph = { sm: 14, md: 18, lg: 20 }[size];

  return (
    <span
      aria-hidden
      className={cx("grid shrink-0 place-items-center rounded-xl", box, className)}
      style={{ background: `${category.color}22`, color: category.color }}
    >
      <Icon size={glyph} strokeWidth={2} />
    </span>
  );
}

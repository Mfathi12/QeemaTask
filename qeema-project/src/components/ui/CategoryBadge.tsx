import { Badge } from "./Badge";

export function CategoryBadge({ category }: { category: string }) {
  return (
    <Badge className="max-w-[200px] truncate" title={category}>
      {category}
    </Badge>
  );
}

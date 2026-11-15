import {
  Grid3X3,
  ListOrdered,
  Layers3,
  Route,
  Landmark,
  GalleryVerticalEnd,
} from "lucide-react";
export function TrainingIcon({
  name,
  size = 24,
}: {
  name: string;
  size?: number;
}) {
  const icons: Record<string, typeof Grid3X3> = {
    grid: Grid3X3,
    list: ListOrdered,
    layers: Layers3,
    route: Route,
    palace: Landmark,
    cards: GalleryVerticalEnd,
  };
  const Icon = icons[name] ?? Grid3X3;
  return <Icon size={size} strokeWidth={1.7} />;
}

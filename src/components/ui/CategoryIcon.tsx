import {
  ChartColumn,
  FlaskConical,
  Layers,
  Mountain,
  Pickaxe,
  Scale,
  Truck,
  Wind,
  type LucideIcon,
} from 'lucide-react';
import type { CategoryIcon as CategoryIconName } from '@/lib/content/schemas';

const icons: Record<CategoryIconName, LucideIcon> = {
  pickaxe: Pickaxe,
  layers: Layers,
  wind: Wind,
  truck: Truck,
  mountain: Mountain,
  flask: FlaskConical,
  chart: ChartColumn,
  scale: Scale,
};

export function CategoryIcon({ icon, className }: { icon: CategoryIconName; className?: string }) {
  const Icon = icons[icon];
  return <Icon aria-hidden="true" className={className} />;
}

import {
  Briefcase,
  ChartColumn,
  Cog,
  Compass,
  Drill,
  Factory,
  FlaskConical,
  Gem,
  HardHat,
  Layers,
  Leaf,
  Map as MapIcon,
  Microscope,
  Mountain,
  Pickaxe,
  Scale,
  Truck,
  Wind,
  Wrench,
  Zap,
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
  drill: Drill,
  'hard-hat': HardHat,
  cog: Cog,
  factory: Factory,
  compass: Compass,
  leaf: Leaf,
  zap: Zap,
  gem: Gem,
  map: MapIcon,
  wrench: Wrench,
  microscope: Microscope,
  briefcase: Briefcase,
};

export function CategoryIcon({ icon, className }: { icon: CategoryIconName; className?: string }) {
  const Icon = icons[icon];
  return <Icon aria-hidden="true" className={className} />;
}

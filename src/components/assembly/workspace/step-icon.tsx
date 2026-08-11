// step-icon.tsx: Maps the icon name stored on each assembly step to a Lucide
// icon component, so the data layer can reference icons as plain strings.
import {
  Cable,
  CircuitBoard,
  Cpu,
  Fan,
  HardDrive,
  Layers,
  MemoryStick,
  Zap,
} from "lucide-react";

const ICONS = {
  Cable,
  CircuitBoard,
  Cpu,
  Fan,
  HardDrive,
  Layers,
  MemoryStick,
  Zap,
} as const;

export type StepIconName = keyof typeof ICONS;

export function StepIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = ICONS[name as StepIconName] ?? Cpu;
  return <Icon className={className} strokeWidth={1.8} />;
}

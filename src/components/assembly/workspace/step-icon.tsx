// step-icon.tsx: Maps the icon name stored on assembly steps and tray items to
// a Lucide icon component, so the data layer can reference icons as strings.
import {
  Box,
  Cable,
  CircuitBoard,
  Cpu,
  Fan,
  HardDrive,
  Layers,
  MemoryStick,
  Wrench,
  Zap,
} from "lucide-react";

const ICONS = {
  Box,
  Cable,
  CircuitBoard,
  Cpu,
  Fan,
  HardDrive,
  Layers,
  MemoryStick,
  Wrench,
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

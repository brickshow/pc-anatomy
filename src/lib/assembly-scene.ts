// assembly-scene.ts: The 3D staging data for the assembly workspace.
//
// Each part in the tray maps to a ComponentVisual that describes where the
// part model sits in the build scene, how big it is relative to the chassis,
// and where its mounting markers (screws / ports / clips) live.
//
// This is the "controlled layout" the real assembly mechanics will read from
// later — the workspace snaps parts onto these positions instead of using
// physics. All coordinates are in scene space, relative to the chassis which
// sits centered at the origin, lying flat on the workbench.

export type Vec3 = [number, number, number];

export type ComponentVisual = {
  model: string | null;        // GLB path, or null for primitive placeholder parts
  scale: number;               // scene scale (1 = chassis max dimension)
  position: Vec3;              // final snapped position
  rotation: Vec3;              // euler angles (radians)
  dropRadius: number;          // how close a drop must be to snap (horizontal dist)
  securePoints: Vec3[];        // positions of the mounting markers
  secureLabel: string;         // what the markers are called ("screws", "ports"…)
};

// The workbench surface the ghost part follows and drops land on.
export const BENCH_Y = -0.3;

// The visual + drop data for every tray part.
export const COMPONENT_VISUALS: Record<string, ComponentVisual> = {
  chassis: {
    model: "/models/chasis.glb",
    scale: 1,
    position: [0, 0, 0],
    rotation: [Math.PI / 2, 0, 0],
    dropRadius: 0.42,
    securePoints: [
      [-0.4, -0.24, -0.4],
      [0.4, -0.24, -0.4],
      [-0.4, -0.24, 0.4],
      [0.4, -0.24, 0.4],
    ],
    secureLabel: "feet",
  },
  motherboard: {
    model: "/models/motherboard.glb",
    scale: 0.72,
    position: [0, 0.34, 0],
    rotation: [0, 0, 0],
    dropRadius: 0.42,
    securePoints: [
      [-0.28, 0.42, 0.27],
      [0.28, 0.42, 0.27],
      [-0.28, 0.42, -0.27],
      [0.28, 0.42, -0.27],
    ],
    secureLabel: "screws",
  },
  cpu: {
    model: "/models/cpu.glb",
    scale: 0.11,
    position: [0.13, 0.41, -0.06],
    rotation: [0, 0, 0],
    dropRadius: 0.1,
    securePoints: [[0.13, 0.44, 0.04]],
    secureLabel: "retention lever",
  },
  ram: {
    model: "/models/ram.glb",
    scale: 0.24,
    position: [0.28, 0.44, 0.3],
    rotation: [0, 0, 0],
    dropRadius: 0.12,
    securePoints: [
      [0.28, 0.42, 0.32],
      [0.28, 0.42, 0.28],
    ],
    secureLabel: "clips",
  },
  storage: {
    model: "/models/m.2.glb",
    scale: 0.2,
    position: [0.05, 0.4, -0.3],
    rotation: [0, 0, 0],
    dropRadius: 0.1,
    securePoints: [[0.13, 0.42, -0.3]],
    secureLabel: "screw",
  },
  gpu: {
    model: "/models/gpu.glb",
    scale: 0.5,
    position: [0, 0.48, -0.18],
    rotation: [0, 0, 0],
    dropRadius: 0.2,
    securePoints: [
      [-0.33, 0.44, -0.2],
      [-0.33, 0.44, -0.15],
    ],
    secureLabel: "bracket screws",
  },
  psu: {
    model: "/models/psu.glb",
    scale: 0.3,
    position: [0.25, 0.55, 0.38],
    rotation: [0, 0, 0],
    dropRadius: 0.18,
    securePoints: [
      [0.39, 0.55, 0.3],
      [0.39, 0.55, 0.35],
      [0.39, 0.55, 0.41],
      [0.39, 0.55, 0.46],
    ],
    secureLabel: "screws",
  },
  cooling: {
    model: "/models/cpu_fan.glb",
    scale: 0.2,
    position: [0.13, 0.48, -0.06],
    rotation: [0, 0, 0],
    dropRadius: 0.12,
    securePoints: [],
    secureLabel: "mount",
  },
  cables: {
    model: null, // rendered as a stylized cable bundle primitive
    scale: 1,
    position: [0.32, 0.46, 0.42],
    rotation: [0, 0, 0],
    dropRadius: 0.12,
    securePoints: [
      [0.32, 0.44, 0.44],
      [0.32, 0.44, 0.4],
    ],
    secureLabel: "power headers",
  },
  screws: {
    model: null, // rendered as a tiny bolt primitive
    scale: 0.04,
    position: [-0.55, -0.275, 0.5],
    rotation: [0, 0, 0],
    dropRadius: 0.05,
    securePoints: [],
    secureLabel: "tool",
  },
};

export function getVisual(id: string): ComponentVisual {
  return (
    COMPONENT_VISUALS[id] ?? {
      model: null,
      scale: 0.2,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      dropRadius: 0.15,
      securePoints: [],
      secureLabel: "part",
    }
  );
}

// The horizontal distance in the XZ plane between two points.
export function horizontalDistance(a: Vec3, b: Vec3): number {
  const dx = a[0] - b[0];
  const dz = a[2] - b[2];
  return Math.sqrt(dx * dx + dz * dz);
}

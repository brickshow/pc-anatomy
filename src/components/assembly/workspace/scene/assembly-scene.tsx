"use client";

// assembly-scene.tsx: The interactive 3D workspace for the PC assembly guide.
//
// Everything here is driven by the store (workspace-store.ts) and the staging
// data (assembly-scene.ts). There is no physics — parts snap to the "controlled
// layout" positions in COMPONENT_VISUALS.
//
// What renders:
//   - Workbench   — the bench pad the build sits on
//   - Installed   — parts whose step is done, plus the part of the current step
//   - Ghost       — the part being dragged from the tray, following the pointer
//   - TargetRing  — the glowing drop zone shown while a "place" sub-action is live
//   - ActionRing  — click-to-confirm ring for align / insert / verify sub-actions
//   - Markers     — clickable screws / ports / clips during secure / connect
//
// The DOM (see assembly-viewer / parts-tray) owns pointer capture and writes the
// pointer NDC into drag-bus.ts. This scene reads that every frame, projects it
// onto the workbench plane, and reports the ghost position + drop validity back
// through the bus so the DOM handler can finalize the drop on pointerup.

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Grid, OrbitControls, useCursor, useGLTF } from "@react-three/drei";
import { Environment } from "@/components/viewer/Environment";
import { Lights } from "@/components/viewer/Lights";
import { ASSEMBLY_INVENTORY, ASSEMBLY_STEPS } from "@/lib/assembly";
import {
  BENCH_Y,
  getVisual,
  horizontalDistance,
  type ComponentVisual,
  type Vec3,
} from "@/lib/assembly-scene";
import { useWorkspace } from "@/lib/workspace-store";
import { dragBus } from "./drag-bus";

const BENCH_HALF = 2.4;
const SNAP_SECONDS = 0.5;

const ACCENT = "#4d8dff";
const ACCENT_BRIGHT = "#7ab0ff";
const EMERALD = "#34d399";

const DRAG_PHASES = new Set(["dragging", "valid-target", "invalid-target"]);
const GHOST_PHASES = new Set([
  "selecting",
  "dragging",
  "valid-target",
  "invalid-target",
  "placing",
]);

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

// Sizes a raw GLB so its biggest dimension is 1 and its center sits at the
// origin. The staging data in assembly-scene.ts is authored in those units.
function normalizeModel(raw: THREE.Object3D): THREE.Object3D {
  const box = new THREE.Box3().setFromObject(raw);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z, 1e-6);
  const s = 1 / maxDim;
  const clone = raw.clone(true);
  clone.scale.multiplyScalar(s);
  clone.position.set(-center.x * s, -center.y * s, -center.z * s);
  clone.updateMatrixWorld(true);
  return clone;
}

// The workbench pad the chassis rests on.
function Workbench() {
  return (
    <group>
      <mesh position={[0, BENCH_Y - 0.045, 0]} receiveShadow>
        <boxGeometry args={[BENCH_HALF * 2, 0.09, BENCH_HALF * 2]} />
        <meshStandardMaterial color="#0a1120" roughness={0.9} metalness={0.1} />
      </mesh>
      <Grid
        position={[0, BENCH_Y + 0.002, 0]}
        args={[BENCH_HALF * 2, BENCH_HALF * 2]}
        cellSize={0.12}
        cellThickness={0.6}
        cellColor="#14233c"
        sectionSize={0.6}
        sectionThickness={1}
        sectionColor="#24406e"
        fadeDistance={1000}
        fadeStrength={0}
        infiniteGrid={false}
      />
      {/* Soft glow pad under the build zone. */}
      <mesh position={[0, BENCH_Y + 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.15, 64]} />
        <meshBasicMaterial color={ACCENT} transparent opacity={0.06} depthWrite={false} />
      </mesh>
    </group>
  );
}

// Renders one GLB model at the staging position/rotation/scale. Materials are
// duplicated per instance so the ghost can be made transparent without
// affecting the installed copy.
function ModelPart({ visual, opacity = 1 }: { visual: ComponentVisual; opacity?: number }) {
  const { scene } = useGLTF(visual.model!);
  const raw = useMemo(() => scene.clone(true), [scene]);
  const model = useMemo(() => {
    const m = normalizeModel(raw);
    m.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
      if (!mat) return;
      mesh.material = Array.isArray(mat)
        ? mat.map((x) => x.clone())
        : mat.clone();
    });
    return m;
  }, [raw]);

  // Ghost opacity: applied once, only to this instance's cloned materials.
  useEffect(() => {
    if (opacity >= 1) return;
    model.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
      if (!mat) return;
      const mats = Array.isArray(mat) ? mat : [mat];
      for (const m of mats) {
        m.transparent = true;
        m.opacity = opacity;
        m.depthWrite = false;
      }
    });
  }, [model, opacity]);

  return (
    <group position={visual.position} rotation={visual.rotation} scale={visual.scale}>
      <primitive object={model} />
    </group>
  );
}

// Stylized primitives for the two parts without a GLB (cables, screws).
function PrimitivePart({ id, visual, opacity = 1 }: { id: string; visual: ComponentVisual; opacity?: number }) {
  if (id === "cables") {
    return (
      <group position={visual.position} rotation={visual.rotation}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusKnotGeometry args={[0.14, 0.045, 160, 24]} />
          <meshStandardMaterial
            color="#1e2f52"
            roughness={0.6}
            metalness={0.2}
            transparent={opacity < 1}
            opacity={opacity}
            depthWrite={opacity >= 1}
          />
        </mesh>
        <mesh position={[0.12, 0, -0.06]}>
          <torusGeometry args={[0.09, 0.035, 16, 40]} />
          <meshStandardMaterial
            color="#16243f"
            roughness={0.7}
            metalness={0.15}
            transparent={opacity < 1}
            opacity={opacity}
            depthWrite={opacity >= 1}
          />
        </mesh>
      </group>
    );
  }
  // screws — a tiny bolt primitive
  return (
    <group position={visual.position} rotation={visual.rotation}>
      <mesh>
        <cylinderGeometry args={[0.028, 0.028, 0.09, 14]} />
        <meshStandardMaterial
          color="#9fb2cf"
          metalness={0.85}
          roughness={0.3}
          transparent={opacity < 1}
          opacity={opacity}
          depthWrite={opacity >= 1}
        />
      </mesh>
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.02, 6]} />
        <meshStandardMaterial
          color="#b7c6de"
          metalness={0.85}
          roughness={0.25}
          transparent={opacity < 1}
          opacity={opacity}
          depthWrite={opacity >= 1}
        />
      </mesh>
    </group>
  );
}

function PartMesh({ id, visual, opacity = 1 }: { id: string; visual: ComponentVisual; opacity?: number }) {
  if (visual.model) return <ModelPart visual={visual} opacity={opacity} />;
  return <PrimitivePart id={id} visual={visual} opacity={opacity} />;
}

// All parts that are permanently mounted. A part renders once its step is
// completed, once an optional part has been placed, or while it is the part of
// the current step mid-build (post-snap).
function InstalledParts() {
  const completedStepIds = useWorkspace((s) => s.completedStepIds);
  const optionalPlaced = useWorkspace((s) => s.optionalPlaced);
  const stepIndex = useWorkspace((s) => s.stepIndex);
  const phase = useWorkspace((s) => s.phase);

  const step = ASSEMBLY_STEPS[stepIndex];
  const currentLive =
    phase === "placed" || phase === "securing" || phase === "secured" || phase === "completed";

  return (
    <>
      {ASSEMBLY_INVENTORY.map((item) => {
        const installed =
          completedStepIds.includes(item.stepId ?? -1) ||
          optionalPlaced.includes(item.id) ||
          (item.stepId === step.id && step.component === item.id && currentLive);
        if (!installed) return null;
        return <PartMesh key={item.id} id={item.id} visual={getVisual(item.id)} />;
      })}
    </>
  );
}

// A flat, pulsing ring pad on the workbench. Clicking it triggers the given
// action (drop / align / verify).
function RingPad({
  x,
  z,
  radius,
  color,
  onAct,
}: {
  x: number;
  z: number;
  radius: number;
  color: string;
  onAct: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);
  const ring = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    ring.current?.scale.setScalar(1 + Math.sin(t * 3.5) * 0.05);
  });

  return (
    <group position={[x, BENCH_Y + 0.02, z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[radius, 48]} />
        <meshBasicMaterial color={color} transparent opacity={0.12} depthWrite={false} />
      </mesh>
      <mesh
        ref={ring}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerDown={(e) => {
          e.stopPropagation();
          onAct();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        <ringGeometry args={[radius * 0.82, radius, 48]} />
        <meshBasicMaterial color={color} transparent opacity={0.9} depthWrite={false} />
      </mesh>
    </group>
  );
}

// The glowing drop zone shown while a "place" sub-action is live.
function TargetRing() {
  const phase = useWorkspace((s) => s.phase);
  const stepIndex = useWorkspace((s) => s.stepIndex);
  const subProgress = useWorkspace((s) => s.subProgress);
  const completedStepIds = useWorkspace((s) => s.completedStepIds);

  const step = ASSEMBLY_STEPS[stepIndex];
  const sub = step.subActions[subProgress[step.id] ?? 0];
  const show =
    sub?.kind === "place" &&
    !completedStepIds.includes(step.id) &&
    ["idle", "selecting", "dragging", "valid-target", "invalid-target"].includes(phase);
  if (!show) return null;

  const visual = getVisual(step.component);
  return (
    <RingPad
      x={visual.position[0]}
      z={visual.position[2]}
      radius={Math.max(0.16, visual.dropRadius)}
      color={ACCENT}
      onAct={() => useWorkspace.getState().placeFromTarget()}
    />
  );
}

// Click-to-confirm ring for align / insert (after placement) and verify.
function ActionRings() {
  const phase = useWorkspace((s) => s.phase);
  const stepIndex = useWorkspace((s) => s.stepIndex);
  const subProgress = useWorkspace((s) => s.subProgress);

  const step = ASSEMBLY_STEPS[stepIndex];
  const sub = step.subActions[subProgress[step.id] ?? 0];
  if (!sub) return null;

  const visual = getVisual(step.component);
  const radius = Math.max(0.16, visual.dropRadius);
  const act = () => useWorkspace.getState().completeSubAction();

  if (phase === "placed" && (sub.kind === "align" || sub.kind === "insert")) {
    return (
      <RingPad
        x={visual.position[0]}
        z={visual.position[2]}
        radius={radius}
        color={ACCENT_BRIGHT}
        onAct={act}
      />
    );
  }
  if (phase === "secured" && sub.kind === "verify") {
    return (
      <RingPad
        x={visual.position[0]}
        z={visual.position[2]}
        radius={radius}
        color={EMERALD}
        onAct={act}
      />
    );
  }
  return null;
}

// One clickable mounting marker (screw / clip / port / lever).
// The pulse offset is derived deterministically from the marker position so
// each marker animates out of phase without impure calls during render.
function MarkerPoint({ position, radius, done }: { position: Vec3; radius: number; done: boolean }) {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);
  const mesh = useRef<THREE.Mesh>(null);
  const offset = (position[0] * 1.9 + position[2] * 3.1) % (Math.PI * 2);

  useFrame(({ clock }) => {
    if (done || !mesh.current) return;
    const t = clock.getElapsedTime();
    mesh.current.scale.setScalar(1 + Math.sin(t * 5 + offset) * 0.15);
  });

  return (
    <mesh
      ref={mesh}
      position={position}
      onPointerDown={(e) => {
        e.stopPropagation();
        useWorkspace.getState().clickMarker();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      <sphereGeometry args={[radius, 20, 20]} />
      <meshStandardMaterial
        color={done ? EMERALD : ACCENT}
        emissive={done ? EMERALD : ACCENT}
        emissiveIntensity={done ? 0.7 : 1.4}
        transparent
        opacity={0.95}
        roughness={0.3}
        metalness={0.1}
      />
    </mesh>
  );
}

// The screws / clips / ports to click during a secure / connect sub-action.
function Markers() {
  const phase = useWorkspace((s) => s.phase);
  const stepIndex = useWorkspace((s) => s.stepIndex);
  const markerProgress = useWorkspace((s) => s.markerProgress);
  const subProgress = useWorkspace((s) => s.subProgress);

  if (phase !== "securing") return null;
  const step = ASSEMBLY_STEPS[stepIndex];
  const sub = step.subActions[subProgress[step.id] ?? 0];
  if (!sub || (sub.kind !== "secure" && sub.kind !== "connect")) return null;

  const visual = getVisual(step.component);
  const pts = visual.securePoints;
  if (!pts.length) return null;

  const radius = Math.max(0.018, visual.scale * 0.05);
  return (
    <>
      {pts.map((p, i) => (
        <MarkerPoint key={i} position={p} radius={radius} done={i < markerProgress} />
      ))}
    </>
  );
}

// The part being dragged (ghost), snap animation, and the pointer raycast onto
// the workbench that feeds drag-bus.
function InteractionDriver() {
  const phase = useWorkspace((s) => s.phase);
  const activeItemId = useWorkspace((s) => s.activeItemId);

  const groupRef = useRef<THREE.Group>(null);
  const snapRef = useRef<{ from: THREE.Vector3; t: number; done: boolean } | null>(null);
  const targetRef = useRef<THREE.Vector3 | null>(null);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const benchPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), -BENCH_Y), []);

  useEffect(() => {
    if (!activeItemId) {
      targetRef.current = null;
      return;
    }
    const v = getVisual(activeItemId);
    targetRef.current = new THREE.Vector3(v.position[0], v.position[1], v.position[2]);
  }, [activeItemId]);

  useFrame(({ camera }, delta) => {
    const st = useWorkspace.getState();
    const g = groupRef.current;
    const target = targetRef.current;

    // --- project the pointer onto the workbench and report validity ---
    if (st.activeItemId && DRAG_PHASES.has(st.phase)) {
      const v = getVisual(st.activeItemId);
      const ndc = dragBus.ndc;
      if (ndc) {
        raycaster.setFromCamera(new THREE.Vector2(ndc.x, ndc.y), camera);
        const hit = new THREE.Vector3();
        if (raycaster.ray.intersectPlane(benchPlane, hit)) {
          hit.x = clamp(hit.x, -BENCH_HALF + 0.05, BENCH_HALF - 0.05);
          hit.z = clamp(hit.z, -BENCH_HALF + 0.05, BENCH_HALF - 0.05);
          dragBus.ghost = { x: hit.x, y: BENCH_Y, z: hit.z };
          const valid =
            horizontalDistance([hit.x, 0, hit.z], [v.position[0], 0, v.position[2]]) <
            v.dropRadius;
          dragBus.valid = valid;
          dragBus.message = valid
            ? ""
            : ASSEMBLY_STEPS[st.stepIndex].invalidDropMessage;
          st.setDragValidity(valid);
        }
      }
    }

    if (!g) return;

    // --- snap animation after an accepted drop ---
    if (st.phase === "placing") {
      if (target) {
        if (!snapRef.current) {
          const from = dragBus.ghost
            ? new THREE.Vector3(dragBus.ghost.x, dragBus.ghost.y, dragBus.ghost.z)
            : new THREE.Vector3(target.x, target.y + 0.9, target.z);
          snapRef.current = { from, t: 0, done: false };
        }
        const snap = snapRef.current;
        snap.t = Math.min(1, snap.t + delta / SNAP_SECONDS);
        const e = easeOutCubic(snap.t);
        const pos = new THREE.Vector3().lerpVectors(snap.from, target, e);
        pos.y += Math.sin(e * Math.PI) * 0.45;
        g.position.copy(pos);
        if (snap.t >= 1 && !snap.done) {
          snap.done = true;
          st.completeSubAction();
        }
        return;
      }
    } else if (snapRef.current) {
      // Leaving the snap phase — reset so the next drop starts clean.
      snapRef.current = null;
    }

    // --- hover / preview positioning ---
    if (st.phase === "selecting" && target) {
      g.position.set(target.x, target.y + 0.35, target.z);
    } else if (st.activeItemId && target) {
      const v = getVisual(st.activeItemId);
      const lift = target.y + v.scale * 0.6 + 0.05;
      const gh = dragBus.ghost;
      g.position.set(gh ? gh.x : target.x, lift, gh ? gh.z : target.z);
    }
  });

  const visual = activeItemId ? getVisual(activeItemId) : null;
  if (!visual || !GHOST_PHASES.has(phase)) return null;

  return (
    <group ref={groupRef}>
      <PartMesh id={activeItemId!} visual={visual} opacity={0.55} />
    </group>
  );
}

// Drives the guided "Show me how" auto-build: whenever showMeActive is set, it
// advances the current interaction after a short delay.
function useShowMeDriver() {
  useEffect(() => {
    let timer: number | undefined;
    const kick = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        const s = useWorkspace.getState();
        if (!s.showMeActive || s.finished) return;
        const step = ASSEMBLY_STEPS[s.stepIndex];
        const sub = step.subActions[s.subProgress[step.id] ?? 0];
        if (!sub) return;
        if (s.phase === "idle" && sub.kind === "place") {
          s.selectItem(step.component);
          s.placeFromTarget();
        } else if (s.phase === "placed") {
          s.completeSubAction();
        } else if (s.phase === "securing") {
          s.clickMarker();
        } else if (s.phase === "secured") {
          s.completeSubAction();
        } else if (s.phase === "completed" && s.successStepId) {
          s.advanceFromSuccess();
        }
      }, 650);
    };
    const unsub = useWorkspace.subscribe(kick);
    kick();
    return () => {
      window.clearTimeout(timer);
      unsub();
    };
  }, []);
}

function SceneContent() {
  useShowMeDriver();
  return (
    <>
      <Workbench />
      <InstalledParts />
      <InteractionDriver />
      <TargetRing />
      <ActionRings />
      <Markers />
    </>
  );
}

export function AssemblyScene() {
  const phase = useWorkspace((s) => s.phase);
  const dragging = DRAG_PHASES.has(phase);

  useEffect(
    () => () => {
      dragBus.reset();
    },
    [],
  );

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [3, 2.2, 3.2], fov: 38, near: 0.05, far: 40 }}
      gl={{ antialias: true, alpha: true }}
    >
      <fog attach="fog" args={["#05080f", 9, 22]} />
      <Suspense fallback={null}>
        <Lights />
        <Environment />
        <SceneContent />
      </Suspense>
      <OrbitControls
        enabled={!dragging}
        target={[0, 0.1, 0]}
        enablePan={false}
        minDistance={1.4}
        maxDistance={6.5}
        maxPolarAngle={1.38}
        makeDefault
      />
    </Canvas>
  );
}

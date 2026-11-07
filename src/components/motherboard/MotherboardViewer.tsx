"use client";

// MotherboardViewer.tsx: The interactive 3D motherboard viewer. It loads the
// motherboard GLB model, computes clickable "hotspots" for each part, lets the
// user select a part (highlighting it and focusing the camera on it), and shows
// a sidebar with details about the selected part.

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useInView } from "react-intersection-observer";
import * as THREE from "three";
import { ContactShadows, useGLTF, useProgress } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { Lights } from "@/components/viewer/Lights";
import { Environment } from "@/components/viewer/Environment";
import { Controls } from "@/components/viewer/Controls";
import { Hotspot } from "./Hotspot";
import { Sidebar } from "./Sidebar";
import { HighlightManager } from "./HighlightManager";
import { useSelectedComponent } from "@/hooks/useSelectedComponent";
import { useCameraFocus } from "@/hooks/useCameraFocus";
import { useExplorer } from "@/lib/store";
import { regionForNodes, floatOffset, type MeshRegion } from "@/utils/getMeshCenter";
import { resetCameraPosition } from "@/utils/focusCamera";
import { MOTHERBOARD_PARTS } from "@/data/motherboardComponents";

// Largest allowed size for the model's biggest dimension (for scaling).
const MAX_DIM = 1;
// Path to the motherboard 3D model file.
const MOTHERBOARD_MODEL = "/models/motherboard.glb";

// Basic info about the loaded model, used to frame the camera.
type ModelInfo = {
  model: THREE.Object3D;
  radius: number;
};

// Resizes and recenters the motherboard model so it fits the view.
function normalizeModel(raw: THREE.Object3D): THREE.Object3D {
  // Measure the model's bounding box.
  const box = new THREE.Box3().setFromObject(raw);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  // Scale so the largest side becomes MAX_DIM.
  const maxDim = Math.max(size.x, size.y, size.z, 1e-6);
  const s = MAX_DIM / maxDim;

  // Clone and apply scale, then center it at the origin.
  const clone = raw.clone(true);
  clone.scale.multiplyScalar(s);
  clone.position.set(-center.x * s, -center.y * s, -center.z * s);
  clone.updateMatrixWorld(true);
  return clone;
}

// Loads the motherboard model, normalizes it, and places a shadow beneath it.
function MoboScene({ onReady }: { onReady: (info: ModelInfo) => void }) {
  const { scene } = useGLTF(MOTHERBOARD_MODEL);
  const raw = useMemo(() => scene.clone(true), [scene]);
  const model = useMemo(() => normalizeModel(raw), [raw]);

  // Tell the parent about the model once it's ready (for camera framing).
  useEffect(() => {
    const radius = new THREE.Box3()
      .setFromObject(model)
      .getBoundingSphere(new THREE.Sphere()).radius;
    onReady({ model, radius });
  }, [model, onReady]);

  // Work out where to put the shadow and how big it should be.
  const { floor, shadowScale } = useMemo(() => {
    const sphere = new THREE.Box3()
      .setFromObject(model)
      .getBoundingSphere(new THREE.Sphere());
    return {
      floor: sphere.center.y - sphere.radius - 0.015,
      shadowScale: Math.min(5, Math.max(2, sphere.radius * 4.5)),
    };
  }, [model]);

  return (
    <>
      {/* Draw the motherboard model. */}
      <primitive object={model} />
      {/* Soft fake shadow on the ground under the board. */}
      <ContactShadows
        position={[0, floor, 0]}
        opacity={0.55}
        scale={shadowScale}
        blur={2.2}
        far={2}
        resolution={512}
        color="#04070c"
      />
    </>
  );
}

// A flat pulsing ring that appears around the currently selected part.
function SelectionRing({ position, radius }: { position: THREE.Vector3; radius: number }) {
  const ref = useRef<THREE.Mesh>(null);
  // Every frame, make the ring gently grow and shrink (pulse).
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    const pulse = 1 + Math.sin(t * 3) * 0.09;
    ref.current.scale.setScalar(pulse);
    const mat = ref.current.material as THREE.MeshBasicMaterial;
    mat.opacity = 0.5 + Math.sin(t * 3) * 0.22;
  });
  return (
    // A flat ring lying on the board (rotated so it faces up).
    <mesh ref={ref} position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[radius * 0.82, radius * 0.94, 48]} />
      {/* Glowy additive-blended ring so it looks like a highlight. */}
      <meshBasicMaterial
        color="#2fd4ff"
        transparent
        opacity={0.55}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

// The interactive part of the scene: hotspots, highlights, and camera logic.
function MoboRig({
  modelInfo,
  selectedId,
  onSelect,
  autoRotate,
  resetSeq,
}: {
  modelInfo: ModelInfo;
  selectedId: string | null;
  onSelect: (id: string) => void;
  autoRotate: boolean;
  resetSeq: number;
}) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const controls = useThree((s) => s.controls) as OrbitControlsImpl | null;

  // Keep the latest camera/controls in refs so callbacks always see current values.
  const cameraRef = useRef(camera);
  useEffect(() => {
    cameraRef.current = camera;
  }, [camera]);

  const controlsRef = useRef<OrbitControlsImpl | null>(controls);
  useEffect(() => {
    controlsRef.current = controls;
  }, [controls]);

  const getCamera = useCallback(() => cameraRef.current, []);
  const getControls = useCallback(() => controlsRef.current, []);

  // A hook that smoothly moves the camera to focus on a part (or resets).
  const { isMoving, focusOn, reset: resetCamera } = useCameraFocus(
    getCamera,
    getControls
  );

  // For every part, compute the 3D region of the model's meshes it covers.
  const regions = useMemo(() => {
    const map = new Map<string, MeshRegion>();
    for (const part of MOTHERBOARD_PARTS) {
      const region = regionForNodes(modelInfo.model, part.nodes);
      if (region) map.set(part.id, region);
    }
    return map;
  }, [modelInfo]);

  // The "overview" view: the whole board centered at the origin.
  const overview = useMemo(
    () => ({ center: new THREE.Vector3(), radius: modelInfo.radius }),
    [modelInfo]
  );

  // On first load, position the camera to see the whole motherboard.
  const didInitRef = useRef(false);
  useEffect(() => {
    if (didInitRef.current || !controls || regions.size === 0) return;
    didInitRef.current = true;
    resetCameraPosition(camera, controls, overview);
  }, [controls, regions, camera, overview]);

  // When the user presses Reset, return to the overview view.
  useEffect(() => {
    if (resetSeq === 0) return;
    resetCamera(overview);
  }, [resetSeq, resetCamera, overview]);

  // Focus the camera on the part whenever the selection changes.
  const prevSelectedRef = useRef<string | null>(null);
  useEffect(() => {
    if (regions.size === 0) return;
    const prev = prevSelectedRef.current;
    if (selectedId && selectedId !== prev) {
      const region = regions.get(selectedId);
      const part = MOTHERBOARD_PARTS.find((p) => p.id === selectedId);
      if (region) {
        // Fly the camera to the newly selected part, using its preferred view angle.
        focusOn({
          center: region.center,
          radius: region.radius,
          direction: part?.view ? new THREE.Vector3(...part.view) : undefined,
        });
      }
    } else if (!selectedId && prev) {
      // Selection cleared, so go back to the whole-board view.
      resetCamera(overview);
    }
    prevSelectedRef.current = selectedId;
  }, [selectedId, regions, focusOn, resetCamera, overview]);

  // Build the list of clickable hotspots, positioned above each part.
  const hotspots = useMemo(
    () =>
      MOTHERBOARD_PARTS.map((part, index) => {
        const region = regions.get(part.id);
        if (!region) return null;
        return {
          id: part.id,
          label: part.name,
          position: floatOffset(region, part.offset),
          index: index + 1,
        };
      }).filter(Boolean) as {
        id: string;
        label: string;
        position: THREE.Vector3;
        index: number;
      }[],
    [regions]
  );

  // The region of the currently selected part (or null if none selected).
  const selectedRegion = selectedId ? (regions.get(selectedId) ?? null) : null;

  // Frame info for the whole board, used to limit the camera zoom range.
  const frame = useMemo(
    () => ({
      key: "motherboard",
      model: modelInfo.model,
      center: new THREE.Vector3(),
      radius: modelInfo.radius,
    }),
    [modelInfo]
  );

  return (
    <>
      {/* Render every clickable hotspot on the board. */}
      {hotspots.map((hotspot) => (
        <Hotspot
          key={hotspot.id}
          position={hotspot.position}
          index={hotspot.index}
          label={hotspot.label}
          active={hotspot.id === selectedId}
          hidden={isMoving}
          onSelect={() => onSelect(hotspot.id)}
        />
      ))}
      {/* Highlight the selected part's meshes. */}
      <HighlightManager region={selectedRegion} />
      {/* Draw a pulsing ring around the selected part. */}
      {selectedRegion && (
        <SelectionRing position={selectedRegion.center} radius={selectedRegion.radius * 0.5} />
      )}
      {/* Orbit controls; auto-rotate only when nothing is selected or moving. */}
      <Controls autoRotate={autoRotate && !selectedId && !isMoving} frame={frame} />
    </>
  );
}

// Overlay shown while the model is loading (with progress percentage).
function LoadingOverlay() {
  const { active, progress } = useProgress();
  if (!active) return null;
  return (
    <div className="viewer-loading">
      <div className="viewer-loading-spinner" />
      <span>{Math.round(progress)}%</span>
    </div>
  );
}

export function MotherboardViewer({
  mode = "fullscreen",
}: {
  mode?: "fullscreen" | "embedded";
}) {
  const { ref: viewerRef, inView } = useInView({ rootMargin: "200px" });
  // The loaded model (null until ready).
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  // Whether the camera auto-rotates.
  const [autoRotate, setAutoRotate] = useState(true);
  // Counter bumped to reset the camera.
  const [resetSeq, setResetSeq] = useState(0);
  // Selection helpers: which part is selected, select/clear/prev/next.
  const { selectedId, selected, select, clear, next, prev } =
    useSelectedComponent(MOTHERBOARD_PARTS);
  const index = selected ? MOTHERBOARD_PARTS.findIndex((p) => p.id === selected.id) : -1;
  // Sidebar/hotspot panel store actions.
  const openHotspot = useExplorer((s) => s.openHotspot);
  const closeHotspot = useExplorer((s) => s.closeHotspot);
  const setHotspotNav = useExplorer((s) => s.setHotspotNav);

  const handleReady = useCallback((info: ModelInfo) => setModelInfo(info), []);
  const handleReset = useCallback(() => clear(), [clear]);

  // Keep the sidebar open/closed in sync with the selection.
  useEffect(() => {
    if (selectedId && selected) {
      openHotspot(selected, index, MOTHERBOARD_PARTS.length);
    } else {
      closeHotspot();
    }
  }, [selectedId, selected, index, openHotspot, closeHotspot]);

  // Give the sidebar panel its navigation actions (next/prev/reset/close).
  useEffect(() => {
    setHotspotNav({ next, prev, reset: handleReset, close: handleReset });
  }, [next, prev, handleReset, setHotspotNav]);

  return (
    <div ref={viewerRef} className="relative h-full w-full overflow-hidden">
      {/* The WebGL canvas that renders the 3D motherboard scene. */}
      <Canvas
        shadows
        dpr={[1, 1.5]}
        frameloop={inView ? "always" : "never"}
        camera={{ fov: 40, near: 0.05, far: 100 }}
        gl={{ antialias: true, alpha: true }}
      >
        {/* Wait for the model before drawing anything. */}
        <Suspense fallback={null}>
          <Lights />
          <Environment />
          <MoboScene onReady={handleReady} />
          {/* Only add the interactive rig once the model is loaded. */}
          {modelInfo && (
            <MoboRig
              modelInfo={modelInfo}
              selectedId={selectedId}
              onSelect={select}
              autoRotate={autoRotate}
              resetSeq={resetSeq}
            />
          )}
        </Suspense>
      </Canvas>
      <LoadingOverlay />
      {/* Toolbar (pause/rotate + reset) shown only when nothing is selected. */}
      {!selectedId && (
        <div className="viewer-toolbar">
          <button
            type="button"
            aria-label={autoRotate ? "Pause rotation" : "Start rotation"}
            onClick={() => setAutoRotate((v) => !v)}
          >
            {/* Pause or play icon depending on current state. */}
            {autoRotate ? (
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <path fill="currentColor" d="M6 5h4v14H6zM14 5h4v14h-4z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <path fill="currentColor" d="M8 5l11 7-11 7z" />
              </svg>
            )}
            {autoRotate ? "Pause" : "Rotate"}
          </button>
          {/* Reset camera button. */}
          <button
            type="button"
            aria-label="Reset camera"
            onClick={() => setResetSeq((n) => n + 1)}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 12a9 9 0 1 0 2.6-6.3M3 4v5h5"
              />
            </svg>
            Reset
          </button>
        </div>
      )}
      {/* In fullscreen mode, show the details sidebar when a part is selected. */}
      {mode === "fullscreen" && (
        <Sidebar
          component={selected}
          index={index}
          total={MOTHERBOARD_PARTS.length}
          mode={mode}
          name="Motherboard"
          onClose={handleReset}
          onPrev={prev}
          onNext={next}
          onReset={handleReset}
        />
      )}
    </div>
  );
}

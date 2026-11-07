"use client";

// MouseViewer.tsx: The interactive 3D mouse viewer. Loads the mouse GLB model,
// shows clickable hotspots for each part, and on selection highlights the part
// and focuses the camera on it. Unlike the motherboard/monitor viewers, the
// mouse uses pre-defined positions per part (not meshes), and the whole model
// is flipped 180° so the side with the buttons faces the camera.

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useInView } from "react-intersection-observer";
import * as THREE from "three";
import { ContactShadows, useGLTF, useProgress } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { Lights } from "@/components/viewer/Lights";
import { Environment } from "@/components/viewer/Environment";
import { Controls } from "@/components/viewer/Controls";
import { Hotspot } from "@/components/motherboard/Hotspot";
import { Sidebar } from "@/components/motherboard/Sidebar";
import { useSelectedComponent } from "@/hooks/useSelectedComponent";
import { useCameraFocus } from "@/hooks/useCameraFocus";
import { useExplorer } from "@/lib/store";
import { resetCameraPosition } from "@/utils/focusCamera";
import { MOUSE_PARTS, type MousePart } from "@/data/mouseComponents";

// Largest allowed size for the model's biggest dimension (for scaling).
const MAX_DIM = 1;
// Path to the mouse 3D model file.
const MOUSE_MODEL = "/models/mouse.glb";
// Rotates the model 180° around the vertical axis so it faces the correct way.
const MODEL_ROTATION: [number, number, number] = [0, Math.PI, 0];

// Repositions a part's coordinates to match the flipped (180°) model.
function rotatePart(position: [number, number, number]): THREE.Vector3 {
  return new THREE.Vector3(-position[0], position[1], -position[2]);
}

// Basic info about the loaded model, used to frame the camera.
type ModelInfo = {
  model: THREE.Object3D;
  radius: number;
};

// Resizes and recenters the mouse model so it fits the view.
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

// Loads the mouse model, normalizes it, rotates it, and adds a shadow.
function MouseScene({ onReady }: { onReady: (info: ModelInfo) => void }) {
  const { scene } = useGLTF(MOUSE_MODEL);
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
      {/* Draw the mouse model, rotated so its buttons face the camera. */}
      <primitive object={model} rotation={MODEL_ROTATION} />
      {/* Soft fake shadow on the ground under the mouse. */}
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
    // A flat ring lying on the mouse (rotated so it faces up).
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
function MouseRig({
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

  // The "overview" view: the whole mouse centered at the origin.
  const overview = useMemo(
    () => ({ center: new THREE.Vector3(), radius: modelInfo.radius }),
    [modelInfo]
  );

  // On first load, position the camera to see the whole mouse.
  const didInitRef = useRef(false);
  useEffect(() => {
    if (didInitRef.current || !controls) return;
    didInitRef.current = true;
    resetCameraPosition(camera, controls, overview);
  }, [controls, camera, overview]);

  // When the user presses Reset, return to the overview view.
  useEffect(() => {
    if (resetSeq === 0) return;
    resetCamera(overview);
  }, [resetSeq, resetCamera, overview]);

  // Find the data for the currently selected mouse part (if any).
  const selectedPart = selectedId
    ? (MOUSE_PARTS.find((p) => p.id === selectedId) ?? null)
    : null;

  // Focus the camera on the part whenever the selection changes.
  const prevSelectedRef = useRef<string | null>(null);
  useEffect(() => {
    const prev = prevSelectedRef.current;
    if (selectedId && selectedId !== prev) {
      const part = MOUSE_PARTS.find((p) => p.id === selectedId);
      if (part) {
        // Fly to the part's position (corrected to match the rotated model).
        focusOn({
          center: rotatePart(part.position),
          radius: 0.24,
          direction: part.view ? new THREE.Vector3(...part.view) : undefined,
        });
      }
    } else if (!selectedId && prev) {
      // Selection cleared, so go back to the whole-mouse view.
      resetCamera(overview);
    }
    prevSelectedRef.current = selectedId;
  }, [selectedId, focusOn, resetCamera, overview]);

  // Build the list of clickable hotspots from each part's position.
  const hotspots = useMemo(
    () =>
      MOUSE_PARTS.map((part, index) => ({
        id: part.id,
        label: part.name,
        position: new THREE.Vector3(...part.position),
        index: index + 1,
      })),
    []
  );

  // Frame info for the whole mouse, used to limit the camera zoom range.
  const frame = useMemo(
    () => ({
      key: "mouse",
      model: modelInfo.model,
      center: new THREE.Vector3(),
      radius: modelInfo.radius,
    }),
    [modelInfo]
  );

  return (
    <>
      {/* Hotspots and the selection ring live in a group that's rotated
          the same flipped way as the model. */}
      <group rotation={MODEL_ROTATION}>
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
        {/* Draw a pulsing ring around the selected part. */}
        {selectedPart && (
          <SelectionRing
            position={new THREE.Vector3(...selectedPart.position)}
            radius={0.12}
          />
        )}
      </group>
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

export function MouseViewer({
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
    useSelectedComponent<MousePart>(MOUSE_PARTS);
  const index = selected ? MOUSE_PARTS.findIndex((p) => p.id === selected.id) : -1;
  // Sidebar/hotspot panel store actions.
  const openHotspot = useExplorer((s) => s.openHotspot);
  const closeHotspot = useExplorer((s) => s.closeHotspot);
  const setHotspotNav = useExplorer((s) => s.setHotspotNav);

  const handleReady = useCallback((info: ModelInfo) => setModelInfo(info), []);
  const handleReset = useCallback(() => clear(), [clear]);

  // Keep the sidebar open/closed in sync with the selection.
  useEffect(() => {
    if (selectedId && selected) {
      openHotspot(selected, index, MOUSE_PARTS.length);
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
      {/* The WebGL canvas that renders the 3D mouse scene. */}
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
          <MouseScene onReady={handleReady} />
          {/* Only add the interactive rig once the model is loaded. */}
          {modelInfo && (
            <MouseRig
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
          total={MOUSE_PARTS.length}
          mode={mode}
          name="Mouse"
          onClose={handleReset}
          onPrev={prev}
          onNext={next}
          onReset={handleReset}
        />
      )}
    </div>
  );
}

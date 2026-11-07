"use client";

// ComponentViewer.tsx: The main 3D viewer. It spins up a WebGL canvas, loads
// the given component's 3D model, wires up lighting, camera controls,
// post-processing, and a small toolbar (reset camera / pause rotation),
// plus a loading overlay while the model is being fetched.

import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Preload, useProgress } from "@react-three/drei";
import { EffectComposer, Vignette } from "@react-three/postprocessing";
import { useInView } from "react-intersection-observer";
import { Scene, type FrameInfo } from "./Scene";
import { Lights } from "./Lights";
import { Environment } from "./Environment";
import { Controls } from "./Controls";
import { CameraController } from "./CameraController";

export interface ComponentViewerProps {
  component: string;
  mode?: "embedded" | "fullscreen";
  className?: string;
  initialAutoRotate?: boolean;
}

// Overlay shown while the 3D model is still loading (with a percentage).
function LoadingOverlay() {
  const { active, progress } = useProgress();
  // Hide the overlay once loading is done.
  if (!active) return null;
  return (
    <div className="viewer-loading">
      <div className="viewer-loading-spinner" />
      <span>{Math.round(progress)}%</span>
    </div>
  );
}

export function ComponentViewer({
  component,
  mode = "embedded",
  className,
  initialAutoRotate = true,
}: ComponentViewerProps) {
  const { ref: viewerRef, inView } = useInView({ rootMargin: "200px" });
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  // Info about the loaded model (size/center) so the camera can frame it.
  const [frame, setFrame] = useState<FrameInfo | null>(null);
  // Whether the camera should slowly spin by itself.
  const [autoRotate, setAutoRotate] = useState(initialAutoRotate);
  // A counter we bump to tell the camera to reset to its starting view.
  const [resetSeq, setResetSeq] = useState(0);

  useEffect(() => {
    if (inView) setHasBeenVisible(true);
  }, [inView]);

  return (
    <div
      ref={viewerRef}
      className={`viewer-root viewer-backdrop viewer-root--${mode}${className ? ` ${className}` : ""}`}
    >
      {/* The WebGL canvas that draws the whole 3D scene. */}
      {hasBeenVisible ? (
      <Canvas
        shadows
        dpr={[1, 1.5]}
        frameloop={inView ? "always" : "never"}
        camera={{ fov: 40, near: 0.05, far: 100 }}
        gl={{ antialias: true, alpha: true }}
      >
        {/* Keep the canvas empty until the model is ready. */}
        <Suspense fallback={null}>
          <Lights />
          <Environment />
          {/* Load and show the given component's model. */}
          <Scene path={component} onFrame={setFrame} />
          {/* Move the camera to frame the model when it loads or resets. */}
          <CameraController frame={frame} resetSeq={resetSeq} component={component} />
          {/* Mouse orbit + auto-rotate controls around the model. */}
          <Controls autoRotate={autoRotate} frame={frame} />
          {/* Subtle vignette darkening at the screen edges. */}
          <EffectComposer>
            <Vignette eskil={false} offset={0.22} darkness={0.25} />
          </EffectComposer>
          {/* Preload models so later views load faster. */}
          <Preload all />
        </Suspense>
      </Canvas>
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-muted">
          3D model loads when it is near the viewport.
        </div>
      )}
      <LoadingOverlay />
      {/* Toolbar overlaying the viewer: reset camera and toggle rotation. */}
      <div className="viewer-toolbar">
        {/* Reset button: bumps resetSeq to move the camera back to the start. */}
        <button
          type="button"
          aria-label="Reset camera"
          onClick={() => setResetSeq((n) => n + 1)}
        >
          {/* A small refresh/undo icon */}
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
        {/* Pause / rotate button toggles auto-rotation. */}
        <button
          type="button"
          aria-label={autoRotate ? "Pause rotation" : "Start rotation"}
          onClick={() => setAutoRotate((v) => !v)}
        >
          {/* Show a pause icon when rotating, else a play icon. */}
          {autoRotate ? (
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path
                fill="currentColor"
                d="M6 5h4v14H6zM14 5h4v14h-4z"
              />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path
                fill="currentColor"
                d="M8 5l11 7-11 7z"
              />
            </svg>
          )}
          {autoRotate ? "Pause" : "Rotate"}
        </button>
      </div>
    </div>
  );
}

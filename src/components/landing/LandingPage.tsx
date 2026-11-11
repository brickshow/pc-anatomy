"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import type * as THREE from "three";
import { Header } from "@/components/landing/hero/Header";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Roadmap } from "@/components/landing/Roadmap";
import { Community } from "@/components/landing/Community";
import { Footer } from "@/components/landing/Footer";

const HeroCanvas = dynamic(
  () => import("@/components/landing/hero/HeroCanvas").then((m) => m.HeroCanvas),
  { ssr: false },
);

// LandingPage: the main wrapper for the whole marketing page.
// It sets up smooth scrolling and drives the 3D keyboard animations
// that react to the user scrolling through the page.
gsap.registerPlugin(ScrollTrigger);

export function LandingPage({ children }: { children?: React.ReactNode }) {
  const [showHeroScene, setShowHeroScene] = useState(false);
  // How big the 3D model should be and where it starts in the scene
  const modelScale = 18;
  const modelPosition: [number, number, number] = [3, 1.5, -0.9];
  // Refs let us reach into the 3D scene to animate the model and lights
  const modelRef = useRef<THREE.Group>(null);
  const keyLightRef = useRef<THREE.SpotLight>(null);
  // Stores every 3D mesh so we can explode them apart during the final scene
  const meshesRef = useRef<
    | Array<{
        mesh: THREE.Mesh;
        baseX: number;
        baseY: number;
        baseZ: number;
        dirX: number;
        dirY: number;
        dirZ: number;
      }>
    | null
  >(null);
  // Reference to the outermost page div, used as the scroll trigger
  const pageRef = useRef<HTMLDivElement>(null);

  // Runs once when the page mounts to set up animations
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Smooth scrolling via Lenis, synced with GSAP ScrollTrigger
    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
    });
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    const timer = window.setInterval(() => {
      if (!modelRef.current || !pageRef.current) return;

      // The explode data is filled in by KeyboardModel only after the GLB
      // model finishes loading (async). Keep polling until it is ready,
      // otherwise the explode scene would silently be left out of the
      // timeline and the keyboard would never break apart.
      const meshes = meshesRef.current;
      if (!meshes || meshes.length === 0) return;

      window.clearInterval(timer);

      const model = modelRef.current;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: pageRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
        },
      });

      // Scene 1 — zoom out over the first quarter of the scroll
      tl.to(
        model.scale,
        {
          x: 0.35,
          y: 0.35,
          z: 0.35,
          duration: 1,
          ease: "none",
        },
        0
      );

      // Scene 2 — rotate the model and move it to center
      tl.to(
        model.position,
        {
          x: 0,
          y: 0,
          duration: 1,
          ease: "none",
        },
        1
      );
      tl.to(
        model.rotation,
        {
          y: Math.PI * 2,
          duration: 1,
          ease: "none",
        },
        1
      );

      // Scene 3 — light the model with the stage key light and face it front
      tl.to(
        model.rotation,
        {
          y: 0,
          z: 0,
          duration: 1,
          ease: "power2.inOut",
        },
        2
      );
      if (keyLightRef.current) {
        tl.fromTo(
          keyLightRef.current,
          { intensity: 0 },
          {
            intensity: 6,
            duration: 1,
            ease: "power2.inOut",
          },
          2
        );
      }

      // Scene 4 — explode: every mesh flies outward from the model center
      // (meshes is guaranteed non-empty because we waited for it above)
      if (meshes.length) {
        const targets = meshes.map((m) => {
          const rand = 0.35;
          const dist = Math.hypot(m.baseX, m.baseY, m.baseZ);
          const explode = dist * 2.5 + 0.6;
          // Keep this small animation calculation independent of Three.js so
          // the landing page's eager client bundle does not pull in the 3D engine.
          const dirX = m.dirX + ((Math.random() - 0.5) * rand - m.dirX) * 0.35;
          const dirY = m.dirY + ((Math.random() - 0.5) * rand - m.dirY) * 0.35;
          const dirZ = m.dirZ + ((Math.random() - 0.5) * rand - m.dirZ) * 0.35;
          return {
            mesh: m.mesh,
            x: m.baseX + dirX * explode,
            y: m.baseY + dirY * explode,
            z: m.baseZ + dirZ * explode,
            rx: (Math.random() - 0.5) * 2,
            ry: (Math.random() - 0.5) * 2,
            rz: (Math.random() - 0.5) * 2,
          };
        });

        tl.to(
          targets.map((t) => t.mesh.position),
          {
            x: (i) => targets[i].x,
            y: (i) => targets[i].y,
            z: (i) => targets[i].z,
            duration: 1,
            ease: "power3.inOut",
          },
          3
        );

        tl.to(
          targets.map((t) => t.mesh.rotation),
          {
            x: (i) => targets[i].rx,
            y: (i) => targets[i].ry,
            z: (i) => targets[i].rz,
            duration: 1,
            ease: "power3.inOut",
          },
          3
        );
      }
    }, 100);

    // Cleanup: stop animations and smooth scrolling when the page unmounts
    return () => {
      window.clearInterval(timer);
      gsap.ticker.remove(raf);
      ScrollTrigger.getAll().forEach((st) => st.kill());
      lenis.destroy();
    };
  }, []);

  // Let the headline and primary controls paint before downloading the WebGL
  // viewer and its model. Respect reduced-motion preferences by keeping the
  // static hero instead of starting a continuously animated 3D scene.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setTimeout(() => setShowHeroScene(true), 900);
    return () => window.clearTimeout(timer);
  }, []);

  const renderScene = showHeroScene ? (
    <HeroCanvas
      modelScale={modelScale}
      modelPosition={modelPosition}
      modelRef={modelRef}
      keyLightRef={keyLightRef}
      meshesRef={meshesRef}
    />
  ) : null;

  return (
    // Main page shell: the 3D scene sits fixed behind everything
    <div ref={pageRef} className="relative min-h-screen bg-background text-foreground">
      {/* Fixed global 3D background */}
      <div aria-hidden="true" className="fixed inset-0 z-0">
        {renderScene}
      </div>

      {/* Global legibility gradient — black on the left, transparent on the right */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[5] bg-gradient-to-r from-black/80 via-black/35 to-transparent"
      />

      {/* Scrollable content above the 3D scene */}
      <div className="relative z-10">
        <Header />
        <main>
          <Hero />
          <Features />
          <Roadmap />
          <Community />
        </main>
        <Footer />
        {children}
      </div>
    </div>
  );
}

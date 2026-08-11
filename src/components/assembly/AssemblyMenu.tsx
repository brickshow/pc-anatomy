"use client";

// AssemblyMenu.tsx: The PC Assembly homepage styled like a video-game main
// menu. Centered on top of a subtle gradient backdrop: the game title, an
// accent divider, and two menu-style action rows. Small HUD details (corner
// frame, status text) finish the look — clean, not cluttered.
import Link from "next/link";
import { motion } from "framer-motion";
import { Play } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

// Corner brackets that frame the screen like a game HUD (decorative).
const CORNERS = [
  "left-4 top-4 border-l border-t",
  "right-4 top-4 border-r border-t",
  "bottom-4 left-4 border-b border-l",
  "bottom-4 right-4 border-b border-r",
];

// The menu action rows, in order.
const MENU_ITEMS = [
  { href: "/assembly/workspace", label: "Start Assembly", hint: "ENTER" },
  { href: "/explore", label: "Explore Components in 3D", hint: "3D" },
  { href: "/assembly/workspace", label: "View Demo", hint: "DEMO" },
];

export function AssemblyMenu() {
  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Centered game menu. */}
      <div className="relative z-20 flex h-full flex-col items-center justify-center px-6 pb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="flex flex-col items-center"
        >
          {/* The title. */}
          <h1 className="text-[2.6rem] font-extrabold uppercase leading-[0.95] tracking-tight text-foreground sm:text-7xl">
            Build a PC.
            <br />
            <span className="text-accent-bright drop-shadow-[0_0_30px_rgba(111,164,255,0.3)]">
              Step by Step.
            </span>
          </h1>

          {/* Thin accent divider, like on game menu screens. */}
          <div className="mt-7 h-px w-24 bg-linear-to-r from-transparent via-accent/70 to-transparent" />
        </motion.div>

        {/* Menu action rows. */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25, ease: EASE }}
          className="mt-9 flex w-full max-w-xs flex-col gap-2.5"
        >
          {MENU_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="group flex items-center gap-3 rounded-xl border border-transparent px-5 py-3.5 text-left backdrop-blur-sm transition-all duration-200 hover:border-line hover:bg-surface/55"
            >
              {/* Indicator that appears on hover, keeping its slot so nothing shifts. */}
              <span className="flex w-4 shrink-0 items-center justify-center">
                <Play className="h-2.5 w-2.5 fill-accent text-accent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
              </span>
              <span className="text-[13px] font-semibold uppercase tracking-[0.16em] text-foreground/75 transition-colors duration-200 group-hover:text-foreground">
                {item.label}
              </span>
              {/* Key hint on the right, like a game's button legend. */}
              <span className="ml-auto font-mono text-[10px] uppercase tracking-widest text-muted-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                {item.hint}
              </span>
            </Link>
          ))}
        </motion.div>

        {/* Meta line. */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-8 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-2"
        >
          <span className="text-accent">8</span> Components{" "}
          <span className="text-muted">•</span> Beginner Friendly
        </motion.p>
      </div>

      {/* HUD corner brackets + status text. */}
      <div className="pointer-events-none absolute inset-0 z-20 hidden sm:block">
        {CORNERS.map((c) => (
          <span key={c} className={`absolute h-6 w-6 border-line-strong ${c}`} />
        ))}
        <span className="absolute bottom-5 left-6 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-2">
          Open Source · MIT
        </span>
        <span className="absolute bottom-5 right-6 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-2">
          8 Components · v0.1
        </span>
      </div>
    </div>
  );
}

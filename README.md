<p align="center">
  <img src="public/logo.png" alt="PC Anatomy logo" width="96" height="96" />
</p>

<h1 align="center">PC Anatomy</h1>

<p align="center">
  <strong>Explore computer anatomy in 3D — an open-source, interactive atlas of the computer on your desk.</strong><br />
  Inspect 3D computer components, peel apart a CPU, spin the GPU, and trace the motherboard to understand how your machine works.
</p>

<p align="center">
  <a href="https://github.com/brickshow/pc-anatomy"><img src="https://img.shields.io/badge/Open_Source-100%25-4d8dff?style=for-the-badge&logo=opensourceinitiative&logoColor=white" alt="Open Source" /></a>
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js 16" /></a>
  <a href="https://threejs.org/"><img src="https://img.shields.io/badge/Three.js-r185-7a5cff?style=for-the-badge&logo=threedotjs&logoColor=white" alt="Three.js" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4" /></a>
</p>

<p align="center">
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19-087ea4?style=for-the-badge&logo=react&logoColor=white" alt="React 19" /></a>
  <a href="https://motion.dev/"><img src="https://img.shields.io/badge/Framer_Motion-13-8B5CF6?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion" /></a>
  <a href="https://zustand.docs.pmnd.rs/"><img src="https://img.shields.io/badge/Zustand-Simple_State-1E3A8A?style=for-the-badge" alt="Zustand" /></a>
</p>

---

> **Computer anatomy in 3D.** Most people use a computer every day but have never seen inside one.
> PC Anatomy is an interactive 3D computer model and learning guide: explore PC parts,
> understand what computer components do, and see how they fit together.

---

## 🚀 Live Demo

> **https://pc-anatomy.brickshow.site** — the production domain is set via the
> `NEXT_PUBLIC_SITE_URL` environment variable (it drives canonical URLs, Open
> Graph tags, sitemap.xml, and robots.txt). The default in the code matches the
> live domain.

- Landing page with cinematic 3D hero: `/`
- Interactive 3D computer and component explorer: `/explore`
- Step-by-step PC assembly guide: `/assembly`

The public search pages are `/`, `/explore`, `/assembly`, and the component learning guides linked from `/explore`.

---

## ✨ What is PC Anatomy?

PC Anatomy is an **interactive 3D computer anatomy platform** that teaches computer hardware by letting you *inspect it*. Explore a 3D computer model, learn what computer components do, and follow each PC part from its role in the system to its physical place in a build. Instead of static diagrams and dry tables, you get:

- 🧠 **Life-sized 3D models** of CPUs, GPUs, motherboards, RAM, storage, PSUs and more.
- 🔬 **Anatomical zoom** — peel a CPU down to its silicon die, or spin a motherboard like it's on a turntable.
- 🖱️ **Click-to-learn hotspots** on every component, with clear explanations of *what it does* and *why it matters*.
- 📚 **Component explanations** alongside the 3D models, with key details available as visitors explore the hardware.
- 💬 **A built-in AI assistant** that answers your hardware questions in natural language.

All of it is **100% open source** and free to use, fork, and learn from.

---

## ✨ Features

| Feature | Description |
| --- | --- |
| 🖥️ **Interactive 3D Explorer** | A full-screen WebGL viewer with orbit, zoom, and hotspot navigation — built on React Three Fiber. |
| 🧩 **16+ Components** | PC Case, CPU + water block, Motherboard, RAM, GPU, M.2 SSD, SATA SSD, HDD, PSU, CPU Cooler, Case Fans, Keyboard, Mouse, Monitor, UPS, and AVR. |
| 🔬 **CPU Layer Explosion** | Dissect the CPU layer by layer — heat spreader, TIM, die, substrate, and IHS — with lift animation. |
| 🔍 **SEO + AI Discovery** | Search metadata and structured data describe the landing page, interactive explorer, assembly guide, and component learning articles. |
| 🛠️ **PC Assembly Guide** | A step-by-step `/assembly` guide connecting build steps to the relevant component and 3D model. |
| 💬 **AI Assistant** | A context-aware chat guide (OpenRouter) that answers hardware questions with Markdown tables, specs and friendly explanations. |
| 🎬 **Landing Page** | A cinematic hero with a shader-based starfield, animated gradient headline, and glassmorphism — built with Framer Motion. |
| ⚡ **Modern Stack** | Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS 4 + Three.js on WebGL. |

---

## 🛠️ Tech Stack

| Layer | Technology |
| --- | --- |
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| **UI Library** | [React 19](https://react.dev/) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **3D Rendering** | [Three.js](https://threejs.org/) + [React Three Fiber 9](https://docs.pmnd.rs/react-three-fiber) |
| **3D Helpers** | [@react-three/drei](https://docs.pmnd.rs/drei) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) |
| **Animations** | [Framer Motion](https://motion.dev/) + [GSAP](https://gsap.com/) + [Lenis](https://lenis.darkroom.engineering/) |
| **State** | [Zustand](https://zustand.docs.pmnd.rs/) (persisted explorer state) |
| **AI Chat** | [OpenRouter](https://openrouter.ai/) |
| **Markdown** | [react-markdown](https://github.com/remarkjs/react-markdown) + [remark-gfm](https://github.com/remarkjs/remark-gfm) |
| **SEO** | App Router metadata, `sitemap.ts`, `robots.ts`, Schema.org JSON-LD (no extra dependencies) |

---

## 📦 Project Structure

A clean, colocated layout under `src/`:

```
src/
├── app/
│   ├── api/
│   │   └── chat/          # OpenRouter-backed AI assistant route
│   ├── assembly/          # Step-by-step PC assembly guide
│   ├── components/
│   │   ├── [slug]/        # Server-rendered component learning articles and 3D views
│   │   └── storage/       # Server-rendered computer storage guide and 3D views
│   ├── explore/           # Full-screen 3D explorer page
│   ├── error.tsx          # Friendly error boundary (no stack traces)
│   ├── globals.css        # Tailwind + custom theme & utilities
│   ├── layout.tsx         # Global metadata, JSON-LD, fonts
│   ├── loading.tsx        # Global loading spinner
│   ├── not-found.tsx      # Custom 404 page
│   ├── page.tsx           # Landing page
│   ├── robots.ts          # robots.txt
│   └── sitemap.ts         # sitemap.xml
├── components/
│   ├── chat/              # AI assistant chat UI
│   ├── detail/            # Component detail panel (specs, hotspots)
│   ├── explorer/          # 3D explorer layout & viewer
│   ├── landing/           # Hero, info sections, footer
│   ├── seo/               # JSON-LD renderer, breadcrumbs, article
│   └── viewer/            # Lazy-loaded 3D model viewer sections
├── data/
│   ├── seo.ts             # Per-component educational content (FAQ, etc.)
│   └── components.ts      # Component metadata & 3D model paths
├── lib/
│   ├── site.ts            # Site identity & absolute URL helpers
│   ├── store.ts           # Explorer state (selected component, etc.)
│   └── support.ts         # Support links & donate QR config
└── styles/
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 20+ (or 22+ for some features)
- A browser with **WebGL** support
- An [OpenRouter](https://openrouter.ai/) API key *(optional, for the AI assistant)*

### Setup

```bash
git clone https://github.com/brickshow/pc-anatomy.git
cd pc-anatomy
npm install
cp .env.example .env.local  # optional
```

### Run

```bash
npm run dev        # start dev server at http://localhost:3000
```

### Build

```bash
npm run build      # production build
npm run start      # serve the production build
```

---

## 🌍 Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | No | Production URL for canonical URLs, OG tags, `sitemap.xml`, and `robots.txt`. Defaults to `https://pc-anatomy.brickshow.site`; override it for another deployment hostname. |
| `OPENROUTER_API_KEY` | No | Enables the AI assistant. Without it, the chat explains it is not configured. |
| `OPENROUTER_MODEL` | No | Overrides the default chat model (e.g. `google/gemma-4-26b-a4b-it:free`). |
| `NEXT_PUBLIC_DONATE_QR_URL` | No | Path to a donation QR code image shown in the support panel. |

> ⚠️ **Never commit real secrets.** `.env.local` is git-ignored. The deployed app reads these from the hosting platform's environment.

---

## 🔍 SEO & AI Answer Engines

PC Anatomy is built to be found — by humans *and* by AI answer engines:

- **Server-rendered component guides** with direct answers, specs, FAQ content, breadcrumbs, and related hardware links.
- **Schema.org JSON-LD**: `WebSite`, `Organization`, `SoftwareApplication`, `Article`, `FAQPage`, and `BreadcrumbList`.
- **Canonical URLs, Open Graph, Twitter cards** on every page, with a global 1200×630 OG image.
- **`sitemap.xml`** listing canonical, indexable pages and **`robots.txt`** with the sitemap reference.
- **No index/no follow hygiene** on error pages and the `/api` surface.
- **Semantic links** connect component guides, the interactive explorer, and the assembly guide.

---

## 🛡️ Security

- Client components never log API keys; the `OPENROUTER_API_KEY` lives server-side only.
- The API route strips instructions and keeps prompts contextual, without echoing secrets.
- No tracking scripts, no analytics on by default, no external requests except the 3D models and fonts you opt into.

---

## 🤝 Contributing

PC Anatomy is a community project — contributions are welcome! Help with 3D models, hotmaps, articles, translations, or code:

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-idea`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push to the branch: `git push origin feature/your-idea`
5. Open a pull request.

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🔖 Topics

`computer-anatomy` · `computer-hardware` · `pc-assembly` · `threejs` · `react` · `nextjs` · `webgl` · `education` · `3d` · `seo`

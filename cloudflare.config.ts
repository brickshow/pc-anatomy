import { bindings, defineConfig, defineWorker } from "cf/config";

export default defineConfig({
  worker: defineWorker({
    name: "computer-anatomy",
    entrypoint: "vinext/server/fetch-handler",
    workersDev: true,
    compatibilityDate: "2026-11-07",
    compatibilityFlags: ["nodejs_compat"],
    domains: [
      {
        hostname: "computer-anatomy.brickshow.site",
        production: true,
        previews: false,
      },
    ],
    assets: {
      htmlHandling: "none",
      notFoundHandling: "none",
      runWorkerFirst: ["/_vinext/static-cache/*"],
    },
    env: {
      ASSETS: bindings.assets(),
    },
  }),
});

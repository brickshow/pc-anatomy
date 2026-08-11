// Temporary script to measure GLB model bounding boxes for accurate
// component placement inside the chassis.
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";

globalThis.self = globalThis;

const loader = new GLTFLoader();
const base = fileURLToPath(new URL("../", import.meta.url));

async function loadModel(url) {
  const path = base + url.replace(/^\.\//, "");
  const data = await readFile(path);
  const buf = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
  return loader.parseAsync(buf, "");
}

const models = [
  "system_unit.glb",
  "system_unit_update.glb",
  "motherboard.glb",
  "cpu.glb",
  "ram.glb",
  "m.2.glb",
  "gpu.glb",
  "psu.glb",
  "hdd.glb",
  "case_fans.glb",
  "cpu_fan.glb",
  "ssd_solid_state_drive.glb",
];

for (const name of models) {
  try {
    const gltf = await loadModel(`./public/models/${name}`);
    const box = new THREE.Box3().setFromObject(gltf.scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    console.log(
      name.padEnd(26),
      "size:", size.toArray().map((n) => n.toFixed(3)).join(",").padEnd(18),
      "center:", center.toArray().map((n) => n.toFixed(3)).join(","),
    );
  } catch (e) {
    console.log(name, "ERROR", String(e).slice(0, 120));
  }
}

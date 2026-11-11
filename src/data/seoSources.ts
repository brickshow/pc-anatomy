export type SeoSource = {
  name: string;
  url: string;
};

// Primary manufacturer and standards-body references for further reading.
export const SEO_SOURCES: Record<string, SeoSource[]> = {
  "pc-case": [
    { name: "Noctua: PC airflow fundamentals", url: "https://www.noctua.at/en/support/faqs/airflow-guide-fundamentals" },
  ],
  cpu: [
    { name: "Intel: CPU and GPU roles", url: "https://www.intel.com/content/www/us/en/products/docs/processors/cpu-vs-gpu.html" },
  ],
  motherboard: [
    { name: "Intel: Motherboard sockets, chipsets, and connectivity", url: "https://www.intel.com/content/www/us/en/gaming/resources/how-to-choose-a-motherboard.html" },
  ],
  ram: [
    { name: "Crucial: Check RAM and motherboard compatibility", url: "https://www.crucial.com/articles/about-memory/is-my-ram-compatible-with-my-motherboard" },
  ],
  gpu: [
    { name: "NVIDIA: GPU parallel processing overview", url: "https://docs.nvidia.com/cuda/cuda-programming-guide/01-introduction/introduction.html" },
  ],
  storage: [
    { name: "Seagate: How hard drives and SSDs store data", url: "https://www.seagate.com/innovation/hard-drives-and-ssds/" },
    { name: "Seagate: SSD interfaces and form factors", url: "https://www.seagate.com/blog/ssd-types/" },
  ],
  ssd: [
    { name: "Seagate: SSD interfaces and form factors", url: "https://www.seagate.com/blog/ssd-types/" },
  ],
  "m2-ssd": [
    { name: "Seagate: SSD interfaces and form factors", url: "https://www.seagate.com/blog/ssd-types/" },
  ],
  hdd: [
    { name: "Seagate: How hard drives and SSDs store data", url: "https://www.seagate.com/innovation/hard-drives-and-ssds/" },
  ],
  "power-supply": [
    { name: "Corsair: Power supply units and efficiency", url: "https://www.corsair.com/us/en/s/power-supplies" },
  ],
  "cpu-cooler": [
    { name: "Noctua: Air cooling or liquid cooling", url: "https://www.noctua.at/en/expertise/guides/air-cooling-or-water-cooling-which-one-to-choose" },
  ],
  "case-fans": [
    { name: "Noctua: PC airflow fundamentals", url: "https://www.noctua.at/en/support/faqs/airflow-guide-fundamentals" },
  ],
  keyboard: [
    { name: "USB-IF: Human Interface Device specifications", url: "https://www.usb.org/hid" },
  ],
  mouse: [
    { name: "USB-IF: Human Interface Device specifications", url: "https://www.usb.org/hid" },
  ],
  monitor: [
    { name: "VESA: DisplayPort capabilities", url: "https://vesa.org/displayport-developer/why-displayport/" },
  ],
  ups: [
    { name: "APC: UPS sizing and battery backup guide", url: "https://www.apc.com/us/en/support/product-support/ups-buying-guide-for-selecting-a-battery-backup-system.jsp" },
  ],
  avr: [
    { name: "APC: UPS sizing and automatic voltage regulation", url: "https://www.apc.com/us/en/support/product-support/ups-buying-guide-for-selecting-a-battery-backup-system.jsp" },
  ],
};

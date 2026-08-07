import { ImageResponse } from "next/og";
import {
  OgImageContent,
  OG_WIDTH,
  OG_HEIGHT,
} from "@/lib/og-image";
import { OG_IMAGE_ALT } from "@/lib/site";

export const alt = OG_IMAGE_ALT;
export const size = { width: OG_WIDTH, height: OG_HEIGHT };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(<OgImageContent />, { ...size });
}
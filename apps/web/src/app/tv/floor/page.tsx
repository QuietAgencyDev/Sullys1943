import { TvBoard } from "../tv-board";
import { getBrand } from "@/lib/brand";

const brand = getBrand();

export const metadata = {
  title: `Floor TV · ${brand.copy.appName}`,
  robots: { index: false, follow: false },
};

export default function FloorTvPage() {
  return <TvBoard profile="floor" />;
}

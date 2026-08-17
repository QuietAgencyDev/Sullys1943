import { TvBoard } from "../tv-board";
import { getBrand } from "@/lib/brand";

const brand = getBrand();

export const metadata = {
  title: `Reception TV · ${brand.copy.appName}`,
  robots: { index: false, follow: false },
};

export default function ReceptionTvPage() {
  return <TvBoard profile="reception" />;
}

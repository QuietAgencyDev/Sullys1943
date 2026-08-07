import { TvBoard } from "../tv-board";

export const metadata = {
  title: "Floor TV · Sully's Boxing Gym",
  robots: { index: false, follow: false },
};

export default function FloorTvPage() {
  return <TvBoard profile="floor" />;
}

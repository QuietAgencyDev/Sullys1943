import { TvBoard } from "../tv-board";

export const metadata = {
  title: "Reception TV · Sully's Boxing Gym",
  robots: { index: false, follow: false },
};

export default function ReceptionTvPage() {
  return <TvBoard profile="reception" />;
}

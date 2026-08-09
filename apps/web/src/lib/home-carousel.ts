/**
 * Homepage gym atmosphere carousel.
 * Drop files in apps/web/public/carousel/ then add an entry below.
 */
export type CarouselShot = {
  src: string;
  alt: string;
};

export const HOME_CAROUSEL_SHOTS: CarouselShot[] = [
  {
    src: "/carousel/kids-01.jpg",
    alt: "Youth class training at Sully's Boxing Gym",
  },
  {
    src: "/carousel/kids-02.jpg",
    alt: "Kids boxing session on the floor at Sully's",
  },
  {
    src: "/gym/heavy-bag.jpg",
    alt: "Training on the heavy bag at Sully's Boxing Gym",
  },
  {
    src: "/gym/legacy-wall.jpg",
    alt: "Historical boxing photos on the wall at Sully's",
  },
  {
    src: "/gym/ring-rest.jpg",
    alt: "Athletes resting ringside at Sully's Boxing Gym",
  },
];

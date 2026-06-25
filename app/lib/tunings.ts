import { Pitch } from "@/app/lib/types";

export type Tuning = {
  value: string;
  name: string;
  pitches: [Pitch, Pitch, Pitch, Pitch, Pitch, Pitch];
};

export const tunings: Tuning[] = [
  {
    value: "e_standard",
    name: "E Standard",
    pitches: [40, 45, 50, 55, 59, 64],
  },
  {
    value: "d_drop",
    name: "Drop D",
    pitches: [38, 45, 50, 55, 59, 64],
  },
  {
    value: "dadgad",
    name: "DADGAD",
    pitches: [38, 45, 50, 55, 57, 62],
  },
];

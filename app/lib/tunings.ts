import { Pitch } from "@/app/lib/types";

export type Tuning = {
  value: string;
  name: string;
  pitches: [Pitch, Pitch, Pitch, Pitch, Pitch, Pitch];
};

/**
 * Tuning options for a 6-string guitar. Each tuning object has these properties:
 *
 * `value`: The form value of the tuning.
 *
 * `name`: The display name of the tuning.
 *
 * `pitches`: The pitches of the strings in the given tuning. Array indices match standard string numbers, such that any `pitches[i]` matches its open note on guitar string `i+1` in the given tuning scheme. (Guitar strings are labeled string 1 to string 6 from high to low.)
 */
export const tunings: Tuning[] = [
  {
    value: "e_standard",
    name: "E Standard",
    pitches: [64, 59, 55, 50, 45, 40],
  },
  {
    value: "d_drop",
    name: "Drop D",
    pitches: [64, 59, 55, 50, 45, 38],
  },
  {
    value: "dadgad",
    name: "DADGAD",
    pitches: [62, 57, 55, 50, 45, 38],
  },
];

export const defaultTuning = tunings.find((t) => t.value === "e_standard")!;

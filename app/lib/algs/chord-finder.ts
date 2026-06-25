import { Tuning } from "@/app/lib/tunings";
import { Enumerator, Pitch } from "@/app/lib/types";

export type Chord = {
  fingering: [GuitarString, Fret, Finger][];
  difficulty: number;
};

export type GuitarString = Enumerator<6, []>;
export type Finger = Enumerator<4, []>;
export type Fret = Enumerator<25, []>;
export type HandSpan = Exclude<Enumerator<7, []>, Enumerator<1, []>>;

export default function chordFinder(
  pitches: Pitch[],
  options: {
    tuning: Tuning;
    capo: Fret;
    minFret: Fret;
    maxFret: Fret;
    span: HandSpan;
  },
  errorCb?: (message: string) => void,
): Chord[] | undefined {
  return;
}

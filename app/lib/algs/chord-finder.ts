import { Tuning } from "@/app/lib/tunings";
import { Enumerator, Pitch } from "@/app/lib/types";

export type Chord = {
  fingering: [GuitarString, Fret, Finger][];
  difficulty: ChordDifficulty;
};

export type GuitarString = Enumerator<6, []>;
export type Finger = Enumerator<4, []> | null;
export type Fret = Enumerator<25, []>;
export type HandSpan = Exclude<Enumerator<7, []>, Enumerator<1, []>>;
export type ChordDifficulty = Enumerator<101, []>;

export type ChordFinderOptions = {
  tuning: Tuning;
  capo: Fret;
  minFret: Fret;
  maxFret: Fret;
  span: HandSpan;
};

type Placement = [GuitarString, Fret];

export default function chordFinder(
  pitches: Pitch[],
  { tuning, capo, minFret, maxFret, span }: ChordFinderOptions,
  errorCb?: (message: string) => void,
): Chord[] | undefined {
  /* Placement possibility generation */

  const getPossiblePlacements = (pitch: Pitch): Placement[] => {
    const possiblePlacements: Placement[] = [];

    for (let guitarString: GuitarString = 0; guitarString < 6; guitarString++) {
      const possibleFret = pitch - tuning.pitches[guitarString];

      if (possibleFret >= minFret && possibleFret <= maxFret)
        possiblePlacements.push([guitarString, possibleFret] as Placement);
    }

    return possiblePlacements;
  };

  const placements: Placement[][] = Array(pitches.length).fill(undefined);
  for (let i = 0; i < placements.length; i++) {
    placements[i] = getPossiblePlacements(pitches[i]);
  }

  // console.log(placements);

  return;
}

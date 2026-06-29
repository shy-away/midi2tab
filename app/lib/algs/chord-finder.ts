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

  /* Chord voicing generation */

  const voicings: Placement[][] = [];

  (function recursiveBacktrack(
    currentCandidates: Placement[] = [],
    placementsIndex: number = 0,
    currentUsedStrings: GuitarString[] = [],
    currentMinFret?: Fret,
    currentMaxFret?: Fret,
  ) {
    // base case: placementIndex has reached end of placements, finding a valid path
    if (placementsIndex === placements.length) {
      voicings.push(currentCandidates!);
      return;
    }

    // first call layer: investigate all possibilities
    if (currentCandidates.length === 0) {
      for (const placement of placements[placementsIndex]) {
        recursiveBacktrack(
          [placement],
          placementsIndex + 1,
          [placement[0]],
          placement[1],
          placement[1],
        );
      }
      return;
    }

    // always false by this point, but silences TS warnings
    if (!currentMinFret || !currentMaxFret) return;

    // determine min/max available next frets
    const availableSpan = span - (currentMaxFret - currentMinFret + 1);
    const minAvailableFret = currentMinFret - availableSpan;
    const maxAvailableFret = currentMaxFret + availableSpan;

    // search next placements
    for (const placement of placements[placementsIndex]) {
      // valid placements satisfy these conditions:
      // 1. not on used strings
      // 2. within minAvailableFret and maxAvailableFret OR use fret 0 (open)
      if (
        !currentUsedStrings.includes(placement[0]) &&
        (placement[1] === 0 ||
          (placement[1] >= minAvailableFret &&
            placement[1] <= maxAvailableFret))
      ) {
        recursiveBacktrack(
          [...currentCandidates, placement],
          placementsIndex + 1,
          [...currentUsedStrings, placement[0]],
          Math.min(currentMinFret, placement[1]) as Fret,
          Math.max(currentMaxFret, placement[1]) as Fret,
        );
      }
    }
  })();

  // console.log(voicings);

  return;
}

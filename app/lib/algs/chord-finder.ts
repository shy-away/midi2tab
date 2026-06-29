import { Tuning } from "@/app/lib/tunings";
import { Enumerator, Pitch } from "@/app/lib/types";
import { Combination, Permutation } from "js-combinatorics";

export type Chord = {
  fingering: FingerAssignment[];
  difficulty: ChordDifficulty;
};

export type GuitarString = Enumerator<6, []>;
export type Finger = Enumerator<4, []> | null;
export type Fret = Enumerator<25, []>;
export type HandSpan = Exclude<Enumerator<7, []>, Enumerator<1, []>>;
export type ChordDifficulty = Enumerator<101, []>;
export type FingerAssignment = [GuitarString, Fret, Finger];

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
      const possibleFret = pitch - (tuning.pitches[guitarString] + capo);

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

    // determine min/max available next frets
    currentMinFret = currentMinFret ?? 0;
    currentMaxFret = currentMaxFret ?? ((maxFret - capo) as Fret);
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

  /* Fingering assignment */

  const getFingerPermutations = (numNotes: number): number[][] => {
    const fingerPermutations: number[][] = [];

    for (const combo of new Combination([0, 1, 2, 3], numNotes)) {
      [...new Permutation(combo)].forEach((permutation) =>
        fingerPermutations.push(permutation),
      );
    }

    return fingerPermutations;
  };

  const fingerings: FingerAssignment[][] = [];

  for (const voicing of voicings) {
    const openNotes: Placement[] = [];
    const frettedNotes: Placement[] = [];

    voicing.forEach((placement: Placement) => {
      if (placement[1] === 0) openNotes.push(placement);
      else frettedNotes.push(placement);
    });

    // sort by fret (placement[1]) ascending, breaking ties by string (placement[0]) descending
    frettedNotes.sort((a: Placement, b: Placement) =>
      a[1] !== b[1] ? a[1] - b[1] : b[0] - a[0],
    );

    const fingerPermutations = getFingerPermutations(frettedNotes.length);

    for (const perm of fingerPermutations) {
      let isValidPerm: boolean = true;

      for (let i = 0; i < perm.length - 1; i++) {
        const currentFinger = perm[i];
        const nextFinger = perm[i + 1];
        const currentNoteFret = frettedNotes[i][1];
        const nextNoteFret = frettedNotes[i + 1][1];

        // if next note is on a higher fret, next finger must be greater than current AND must be valid given fret distance
        if (nextNoteFret > currentNoteFret) {
          const fretDistance = nextNoteFret - currentNoteFret;
          if (!(nextFinger >= currentFinger + fretDistance)) {
            isValidPerm = false;
            break;
          }
        }

        // if next note is on same fret, next finger must be greater than current
        else {
          if (!(nextFinger > currentFinger)) {
            isValidPerm = false;
            break;
          }
        }
      }

      if (isValidPerm) {
        fingerings.push([
          ...openNotes.map(
            (p: Placement): FingerAssignment => [p[0], p[1], null],
          ),
          ...frettedNotes.map(
            (p: Placement, i: number): FingerAssignment => [
              p[0],
              p[1],
              perm[i] as Finger,
            ],
          ),
        ]);
      }
    }
  }

  // console.log(fingerings);

  return;
}

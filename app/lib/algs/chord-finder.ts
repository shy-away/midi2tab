import ranker from "@/app/lib/algs/ranker";
import { Slice, SliceNote } from "@/app/lib/algs/slicer";
import { Tuning } from "@/app/lib/tunings";
import { Enumerator, Pitch } from "@/app/lib/types";
import { Combination, Permutation } from "js-combinatorics";

export type ChordFinderOptions = {
  tuning: Tuning;
  capo: Fret;
  minFret: Fret;
  maxFret: Fret;
  span: HandSpan;
};

export type Chord = {
  fingering: ChordFinger[];
  difficulty: ChordDifficulty;
};

export type ChordFinger = {
  guitarString: GuitarString;
  fret: Fret;
  finger: Finger;
  pitch: Pitch;
  holdover: boolean;
};

export type ChordDifficulty = Enumerator<101, []>;
export type GuitarString = Enumerator<6, []>;
export type Fret = Enumerator<25, []>;
export type Finger = Enumerator<4, []> | null;
export type HandSpan = Exclude<Enumerator<7, []>, Enumerator<1, []>>;

type Placement = {
  guitarString: GuitarString;
  fret: Fret;
  pitch: Pitch;
  holdover: boolean;
};

export default function chordFinder(
  slice: Slice,
  { tuning, capo, minFret, maxFret, span }: ChordFinderOptions,
  errorCb?: (message: string) => void,
): Chord[] | undefined {
  const basePitches = slice.notes;

  function callErrorCb(message: string) {
    if (errorCb) errorCb(`${message} ${JSON.stringify(basePitches)}`);
  }

  if (capo > minFret || minFret > maxFret) {
    callErrorCb("Invalid options.");
    return;
  }

  const voicings: Placement[][] = [];
  const fingerings: ChordFinger[][] = [];

  let pitches = basePitches.slice();

  const rankedPitches = ranker(basePitches);

  let mask = 1;

  const nextPitches = () => {
    pitches = [];
    let rankedPitchesIndex = rankedPitches.length;

    for (let i = 1; i < 2 ** (rankedPitches.length - 1); i <<= 1) {
      rankedPitchesIndex--;
      if ((i & mask) > 0) continue;
      pitches.push(rankedPitches[rankedPitchesIndex]);
    }

    // console.log(JSON.stringify(pitches, undefined, 2));

    mask++;
  };

  while (fingerings.length === 0) {
    /* Placement possibility generation */

    const getPossiblePlacements = (note: SliceNote): Placement[] => {
      const possiblePlacements: Placement[] = [];

      for (
        let guitarString: GuitarString = 0;
        guitarString < 6;
        guitarString++
      ) {
        const possibleFret = note.pitch - (tuning.pitches[guitarString] + capo);

        if (possibleFret >= minFret && possibleFret <= maxFret) {
          possiblePlacements.push({
            guitarString,
            fret: possibleFret,
            pitch: note.pitch,
            holdover: note.holdover,
          } as Placement);
          continue; // only one fret per string can play any given pitch
        }
      }

      return possiblePlacements;
    };

    const placements: Placement[][] = Array(pitches.length).fill(undefined);
    for (let i = 0; i < placements.length; i++) {
      placements[i] = getPossiblePlacements(pitches[i]);

      if (placements[i].length === 0) {
        callErrorCb(`No valid placements for pitch ${pitches[i]}.`);
        return;
      }
    }

    // console.log(placements);

    /* Chord voicing generation */

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
            [placement.guitarString],
            placement.fret,
            placement.fret,
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
          !currentUsedStrings.includes(placement.guitarString) &&
          (placement.fret === 0 ||
            (placement.fret >= minAvailableFret &&
              placement.fret <= maxAvailableFret))
        ) {
          recursiveBacktrack(
            [...currentCandidates, placement],
            placementsIndex + 1,
            [...currentUsedStrings, placement.guitarString],
            Math.min(currentMinFret, placement.fret) as Fret,
            Math.max(currentMaxFret, placement.fret) as Fret,
          );
        }
      }
    })();

    if (voicings.length === 0) {
      nextPitches();
      continue;
    }

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

    for (const voicing of voicings) {
      const openNotes: Placement[] = [];
      const frettedNotes: Placement[] = [];

      voicing.forEach((placement: Placement) => {
        if (placement.fret === 0) openNotes.push(placement);
        else frettedNotes.push(placement);
      });

      // sort by fret ascending, breaking ties by guitarString descending
      frettedNotes.sort((a: Placement, b: Placement) =>
        a.fret !== b.fret ? a.fret - b.fret : b.guitarString - a.guitarString,
      );

      const fingerPermutations = getFingerPermutations(frettedNotes.length);

      for (const perm of fingerPermutations) {
        let isValidPerm: boolean = true;

        for (let i = 0; i < perm.length - 1; i++) {
          const currentFinger = perm[i];
          const nextFinger = perm[i + 1];
          const currentNoteFret = frettedNotes[i].fret;
          const nextNoteFret = frettedNotes[i + 1].fret;

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
              ({
                guitarString,
                fret,
                pitch,
                holdover,
              }: Placement): ChordFinger => {
                return { guitarString, fret, finger: null, pitch, holdover };
              },
            ),
            ...frettedNotes.map(
              (
                { guitarString, fret, pitch, holdover }: Placement,
                i: number,
              ): ChordFinger => {
                return {
                  guitarString,
                  fret,
                  finger: perm[i] as Finger,
                  pitch,
                  holdover,
                };
              },
            ),
          ]);
        }
      }
    }

    if (fingerings.length === 0) {
      nextPitches();
      continue;
    }
  }

  // console.log(fingerings);

  const chords = fingerings.map((fingering: ChordFinger[]) => {
    return { fingering, difficulty: getFingeringDifficulty(fingering) };
  });

  // console.log(JSON.stringify(chords, undefined, 2));

  return chords;
}

const fingerDifficultyMap: ChordDifficulty[] = [0, 5, 10, 20, 30];
const stretchDifficultyMap: ChordDifficulty[] = [0, 5, 10, 25, 40];

function getFingeringDifficulty(fingering: ChordFinger[]): ChordDifficulty {
  const frettedNotes = fingering.filter((e) => e.finger !== null);

  // early return if there's no fretted notes
  if (frettedNotes.length === 0) return 0 as ChordDifficulty;

  // sort from least (lowest on the neck) to greatest (highest on the neck)
  frettedNotes.sort((a: ChordFinger, b: ChordFinger) => a.fret - b.fret);

  // get properties of fingering
  const numFingers = frettedNotes.length;

  const lowestFret = frettedNotes[0].finger!;
  const highestFret = frettedNotes.at(-1)!.finger!;
  const stretch = highestFret - lowestFret;

  // get max difficulties for finger count and stretch
  const maxFingerDifficulty = fingerDifficultyMap.at(-1)!;
  const maxStretchDifficulty = stretchDifficultyMap.at(-1)!;

  // get finger count and stretch difficulties for current fingering
  const fingerDifficulty =
    fingerDifficultyMap[numFingers] ?? maxFingerDifficulty;
  const stretchDifficulty =
    stretchDifficultyMap[stretch] ?? maxStretchDifficulty;

  /* Neck penalty */
  // convert other difficulties to ratios
  const fdRatio = fingerDifficulty / maxFingerDifficulty;
  const sdRatio = stretchDifficulty / maxStretchDifficulty;

  // inverse scale neck position difficulty modifier with lowest fret
  const neckPosModifier = 1.0 - 0.5 * (Math.min(12, lowestFret) - 1);

  // calculate neck penalty
  const neckPenalty = 30 * ((fdRatio + sdRatio * neckPosModifier) / 2);

  // sum difficulties and round
  let difficulty = Math.round(
    fingerDifficulty + stretchDifficulty + neckPenalty,
  );

  // clamp to range [0, 100] for safety
  difficulty = Math.min(100, Math.max(0, difficulty));

  return difficulty as ChordDifficulty;
}

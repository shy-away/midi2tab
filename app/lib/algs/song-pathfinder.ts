import { Chord, Finger, GuitarString } from "@/app/lib/algs/chord-finder";
import { Slice } from "@/app/lib/algs/slicer";

/**
 * Determine the optimal path through the given array of chord options.
 *
 * **Note:** The indices of `slices` are _assumed_ to correspond with the indices of the first dimension of `chords`. That is, `slice[i]`'s chord options are located in `chords[i]`.
 * @param slices Slices of MIDI notes
 * @param chords Chord options corresponding to each MIDI slice
 * @param baselineTime Baseline length of time (used when weighting transition costs)
 * @returns `Chord[]` of the optimal path through the chord options
 */
export function songPathfinder(
  slices: Slice[],
  chords: Chord[][],
  baselineTime: number,
): Chord[] {
  return [];
}

const cache: {
  [key: string]: {
    center: number | null;
    fingerStrings: { guitarString: GuitarString; finger: Finger }[];
  };
} = {};

function getTransitionCost(
  chordA: Chord,
  chordB: Chord,
  transitionTime: number,
): number {
  const cacheKeyA = JSON.stringify(chordA);
  const cacheKeyB = JSON.stringify(chordB);

  if (!cache[cacheKeyA])
    cache[cacheKeyA] = {
      center: getCenter(chordA),
      fingerStrings: chordA.fingering.map(({ guitarString, finger }) => {
        return { guitarString, finger };
      }),
    };

  if (!cache[cacheKeyB])
    cache[cacheKeyB] = {
      center: getCenter(chordB),
      fingerStrings: chordB.fingering.map(({ guitarString, finger }) => {
        return { guitarString, finger };
      }),
    };

  const chordACenter = cache[cacheKeyA].center;
  const chordBCenter = cache[cacheKeyB].center;

  /*
   * The distance cost is calculated such that its result is in range [0, `maxDistanceCost`], and it increases proportionally with the distance between the chord centers. Distances between 0 and 1 are given a cost of 0; distances over 12 are capped at the maximum cost.
   */

  const maxDistanceCost = 50;
  const distanceScalingFactor = maxDistanceCost / 11;

  let distanceCost: number;

  if (!chordACenter || !chordBCenter) {
    distanceCost = 0;
  } else {
    distanceCost =
      Math.abs(chordACenter - chordBCenter) * distanceScalingFactor -
      distanceScalingFactor;
    distanceCost = Math.max(0, Math.min(maxDistanceCost, distanceCost));
  }

  return 0;
}

function getCenter(chord: Chord): number | null {
  const frettedNotes = chord.fingering.filter((e) => e.finger !== null);

  if (frettedNotes.length === 0) return null;

  return (
    frettedNotes.reduce((acc, note) => acc + note.fret, 0) / frettedNotes.length
  );
}

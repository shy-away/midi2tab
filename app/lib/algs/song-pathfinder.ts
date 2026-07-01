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
  function getTransitionCost(
    chordA: Chord,
    chordB: Chord,
    sliceIndex: number,
  ): number {
    const { center: chordACenter, fingerStrings: chordAFingerStrings } =
      fetchChordData(chordA);

    const { center: chordBCenter, fingerStrings: chordBFingerStrings } =
      fetchChordData(chordB);

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

    /*
     * The fingering cost is calculated based on how the fingerings change between chords. Each finger's usage in the transition from chordA to chordB can be in one of three states: lifts off, gets added, or is used in both. If a finger is used in both chords, it may either stay on the same string or move strings; staying imposes no fingering cost, but moving imposes the maximum per-finger cost.
     */

    const maxFingeringCost = 50;
    const maxFingeringCostPerFinger = maxFingeringCost / 4;

    let fingeringCost: number = 0;

    const chordAFingerSet = new Set<Finger>(
      chordAFingerStrings.map(({ finger }) => finger),
    );

    const chordBFingerSet = new Set<Finger>(
      chordBFingerStrings.map(({ finger }) => finger),
    );

    for (let currentFinger: Finger = 0; currentFinger! < 4; currentFinger!++) {
      currentFinger = currentFinger as Finger;

      const chordAHasFinger = chordAFingerSet.has(currentFinger);
      const chordBHasFinger = chordBFingerSet.has(currentFinger);

      // finger lifts off
      if (chordAHasFinger && !chordBHasFinger) {
        fingeringCost += maxFingeringCostPerFinger * 0.3;
      }

      // finger is added
      else if (!chordAHasFinger && chordBHasFinger) {
        fingeringCost += maxFingeringCostPerFinger * 0.4;
      }

      // finger possibly rearticulates
      else if (chordAHasFinger && chordBHasFinger) {
        // does the finger move to a new string?
        if (
          chordAFingerStrings.find(({ finger }) => finger === currentFinger)!
            .guitarString !==
          chordBFingerStrings.find(({ finger }) => finger === currentFinger)!
            .guitarString
        ) {
          fingeringCost += maxFingeringCostPerFinger;
        }
      }
    }

    let holdoverViolationCost: number = 0;

    for (const nextSliceNote of slices[sliceIndex + 1].notes) {
      if (nextSliceNote.holdover) {
        // impose large penalties if chordB changes finger
        // impose HUGE penalties if chordB changes string or fret

        const chordAHeldNote = chordA.fingering.find(
          ({ pitch }) => pitch === nextSliceNote.pitch,
        )!;

        const chordBHeldNote = chordB.fingering.find(
          ({ pitch }) => pitch === nextSliceNote.pitch,
        )!;

        if (chordAHeldNote.fret !== chordBHeldNote.fret) {
          holdoverViolationCost += 1000;
        }

        if (chordAHeldNote.guitarString !== chordBHeldNote.guitarString) {
          holdoverViolationCost += 1000;
        }

        if (chordAHeldNote.finger !== chordBHeldNote.finger) {
          holdoverViolationCost += 200;
        }
      }
    }

    return 0;
  }

  return [];
}

const cache: {
  [key: string]: {
    center: number | null;
    fingerStrings: { guitarString: GuitarString; finger: Finger }[];
  };
} = {};

function fetchChordData(chord: Chord) {
  const cacheKey = JSON.stringify(chord);

  if (!cache[cacheKey])
    cache[cacheKey] = {
      center: getCenter(chord),
      fingerStrings: chord.fingering.map(({ guitarString, finger }) => {
        return { guitarString, finger };
      }),
    };

  return cache[cacheKey];
}

function getCenter(chord: Chord): number | null {
  const frettedNotes = chord.fingering.filter((e) => e.finger !== null);

  if (frettedNotes.length === 0) return null;

  return (
    frettedNotes.reduce((acc, note) => acc + note.fret, 0) / frettedNotes.length
  );
}

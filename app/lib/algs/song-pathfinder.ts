import { Chord } from "@/app/lib/algs/chord-finder";
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

const chordCenterCache: { [key: string]: number } = {};

function getTransitionCost(
  chordA: Chord,
  chordB: Chord,
  transitionTime: number,
): number {
  const cacheKeyA = JSON.stringify(chordA);
  const cacheKeyB = JSON.stringify(chordB);

  if (!chordCenterCache[cacheKeyA])
    chordCenterCache[cacheKeyA] = getCenter(chordA);

  if (!chordCenterCache[cacheKeyB])
    chordCenterCache[cacheKeyB] = getCenter(chordB);

  const chordACenter = chordCenterCache[cacheKeyA];
  const chordBCenter = chordCenterCache[cacheKeyB];

  return 0;
}

function getCenter(chord: Chord): number {
  const frettedNotes = chord.fingering.filter((e) => e.finger);

  return (
    frettedNotes.reduce((acc, note) => acc + note.fret, 0) / frettedNotes.length
  );
}

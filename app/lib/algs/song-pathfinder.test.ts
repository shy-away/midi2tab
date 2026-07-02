import type {
  Chord,
  Finger,
  FingerAssignment,
  GuitarString,
} from "./chord-finder";
import type { Slice } from "./slicer";
import { songPathfinder } from "./song-pathfinder";

function makeChord(
  assignments: Array<{
    pitch: number;
    fret: number;
    guitarString: number;
    finger: number | null;
  }>,
): Chord {
  return {
    difficulty: 0,
    fingering: assignments.map(
      ({ pitch, fret, guitarString, finger }) =>
        ({
          pitch,
          fret,
          guitarString: guitarString as GuitarString,
          finger: finger as Finger,
        }) as FingerAssignment,
    ),
  };
}

describe("Song pathfinder", () => {
  it("finds a simple C-major scale excerpt path", () => {
    const slices: Slice[] = [
      { start: 0, end: 480, notes: [{ pitch: 60, holdover: false }] },
      { start: 480, end: 960, notes: [{ pitch: 62, holdover: false }] },
      { start: 960, end: 1440, notes: [{ pitch: 64, holdover: false }] },
    ];

    const cChord = makeChord([
      { pitch: 60, fret: 1, guitarString: 1, finger: 0 },
    ]);
    const dChord = makeChord([
      { pitch: 62, fret: 3, guitarString: 1, finger: 1 },
    ]);
    const eChord = makeChord([
      { pitch: 64, fret: 5, guitarString: 0, finger: null },
    ]);

    const chords = [[cChord], [dChord], [eChord]];

    expect(songPathfinder(slices, chords, 480)).toEqual([
      cChord,
      dChord,
      eChord,
    ]);
  });

  it("prefers a transition that keeps a sustained note on the same fingering", () => {
    const slices: Slice[] = [
      { start: 0, end: 480, notes: [{ pitch: 60, holdover: false }] },
      {
        start: 480,
        end: 960,
        notes: [
          { pitch: 60, holdover: true },
          { pitch: 62, holdover: false },
        ],
      },
      { start: 960, end: 1440, notes: [{ pitch: 62, holdover: false }] },
    ];

    const cChord = makeChord([
      { pitch: 60, fret: 1, guitarString: 1, finger: 1 },
    ]);
    const holdoverFriendlyChord = makeChord([
      { pitch: 60, fret: 1, guitarString: 1, finger: 1 },
      { pitch: 64, fret: 0, guitarString: 0, finger: null },
    ]);
    const holdoverUnfriendlyChord = makeChord([
      { pitch: 60, fret: 5, guitarString: 2, finger: 3 },
      { pitch: 64, fret: 0, guitarString: 0, finger: null },
    ]);
    const eChord = makeChord([
      { pitch: 64, fret: 0, guitarString: 0, finger: null },
    ]);

    const chords = [
      [cChord],
      [holdoverFriendlyChord, holdoverUnfriendlyChord],
      [eChord],
    ];

    expect(songPathfinder(slices, chords, 480)).toEqual([
      cChord,
      holdoverFriendlyChord,
      eChord,
    ]);
  });
});

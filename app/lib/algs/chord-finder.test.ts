import { Pitch } from "@/app/lib/types";
import { tunings } from "../tunings";
import chordFinder, { ChordFinderOptions } from "./chord-finder";
import { Slice } from "@/app/lib/algs/slicer";

function makeSlice(pitches: Pitch[]): Slice {
  return {
    start: 0,
    end: 480,
    notes: pitches.map((pitch) => ({ pitch, holdover: false })),
  };
}

describe("Chord finder", () => {
  const defaultOptions: ChordFinderOptions = {
    tuning: tunings.find((t) => t.value === "e_standard")!,
    capo: 0,
    minFret: 0,
    maxFret: 15,
    span: 4,
  };

  it("returns chord options for a valid pitch set", () => {
    const errorCb = jest.fn();
    const result = chordFinder(
      makeSlice([60, 64, 67]),
      defaultOptions,
      [],
      errorCb,
    );

    expect(result).toBeDefined();
    expect(result?.chords.length).toBeGreaterThan(0);

    expect(errorCb).not.toHaveBeenCalled();

    for (const chord of result?.chords ?? []) {
      expect(chord.fingering.length).toBeGreaterThan(0);
      expect(typeof chord.difficulty).toBe("number");
    }
  });

  it("calls the error callback when the options are invalid", () => {
    const errorCb = jest.fn();
    const result = chordFinder(
      makeSlice([60, 64, 67]),
      { ...defaultOptions, capo: 2, minFret: 0 },
      [],
      errorCb,
    );

    expect(result).toBeUndefined();
    expect(errorCb).toHaveBeenCalled();
  });

  it("excludes notes when no valid placements exist initially, prioritizing highest and lowest notes", () => {
    const errorCb = jest.fn();
    const result = chordFinder(
      makeSlice([60, 61, 62, 63, 64]),
      defaultOptions,
      [],
      errorCb,
    );

    expect(result).toBeDefined();
    expect(errorCb).not.toHaveBeenCalled();

    for (const chord of result?.chords ?? []) {
      const pitches = chord.fingering.map(({ pitch }) => pitch);
      expect(pitches).toContain(60);
      expect(pitches).toContain(64);
    }
  });
});

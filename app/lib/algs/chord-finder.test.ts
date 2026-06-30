import { tunings } from "../tunings";
import chordFinder, { ChordFinderOptions } from "./chord-finder";

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
    const result = chordFinder([60, 64, 67], defaultOptions, errorCb);

    expect(result).toBeDefined();
    expect(result?.length).toBeGreaterThan(0);
    expect(errorCb).not.toHaveBeenCalled();

    for (const chord of result ?? []) {
      expect(chord.fingering.length).toBeGreaterThan(0);
      expect(typeof chord.difficulty).toBe("number");
    }
  });

  it("calls the error callback when the options are invalid", () => {
    const errorCb = jest.fn();
    const result = chordFinder(
      [60, 64, 67],
      { ...defaultOptions, capo: 2, minFret: 0 },
      errorCb,
    );

    expect(result).toBeUndefined();
    expect(errorCb).toHaveBeenCalled();
  });

  it("calls the error callback when no valid placements exist", () => {
    const errorCb = jest.fn();
    const result = chordFinder([60, 61, 62, 63, 64], defaultOptions, errorCb);

    expect(result).toBeUndefined();
    expect(errorCb).toHaveBeenCalled();
  });
});

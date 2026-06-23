import slicer, { Slice } from "./slicer";

describe("Slice generator", () => {
  describe("Basics", () => {
    const dummyInput = { endTick: 0, notes: [] };

    it("should exist", () => {
      expect(slicer).toBeDefined();
    });

    it("should return an array", () => {
      expect(slicer(dummyInput)).toBeInstanceOf(Array);
    });

    it("returns at least one element", () => {
      expect(slicer(dummyInput).length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Single note input", () => {
    const oneNoteInput = {
      endTick: 480,
      notes: [{ pitch: 60, on: 0, off: 480 }],
    };

    const expectedSlices: Slice[] = [
      { notes: [{ pitch: 60, holdover: false }], start: 0, end: 480 },
    ];

    it("returns one slice", () => {
      expect(slicer(oneNoteInput).length).toEqual(1);
    });

    it("returns correct slice", () => {
      expect(slicer(oneNoteInput)).toEqual<Slice[]>(expectedSlices);
    });
  });

  describe("Two note input", () => {
    const twoNoteInput = {
      endTick: 960,
      notes: [
        { pitch: 60, on: 0, off: 480 },
        { pitch: 62, on: 480, off: 960 },
      ],
    };

    const expectedSlices: Slice[] = [
      { notes: [{ pitch: 60, holdover: false }], start: 0, end: 480 },
      { notes: [{ pitch: 62, holdover: false }], start: 480, end: 960 },
    ];

    it("creates two slices", () => {
      expect(slicer(twoNoteInput).length).toEqual(2);
    });

    it("returns correct slices", () => {
      expect(slicer(twoNoteInput)).toEqual<Slice[]>(expectedSlices);
    });
  });

  describe("Three note input", () => {
    const threeNoteInput = {
      endTick: 1920,
      notes: [
        { pitch: 62, on: 480, off: 1440 },
        { pitch: 60, on: 0, off: 960 },
        { pitch: 64, on: 0, off: 480 },
      ],
    };
  });
});

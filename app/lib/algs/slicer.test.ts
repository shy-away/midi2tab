import slicer, { Slice, SliceNote } from "./slicer";

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

  describe("Single note input (leading rest)", () => {
    const oneNoteInputLeadingRest = {
      endTick: 960,
      notes: [{ pitch: 60, on: 480, off: 960 }],
    };

    const expectedSlices: Slice[] = [
      { notes: [], start: 0, end: 480 },
      { notes: [{ pitch: 60, holdover: false }], start: 480, end: 960 },
    ];

    it("returns two slice", () => {
      expect(slicer(oneNoteInputLeadingRest).length).toEqual(2);
    });

    it("returns correct slices", () => {
      expect(slicer(oneNoteInputLeadingRest)).toEqual<Slice[]>(expectedSlices);
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

  describe("Three note input (with trailing rest)", () => {
    const threeNoteInput = {
      endTick: 1920,
      notes: [
        { pitch: 62, on: 480, off: 1440 },
        { pitch: 60, on: 0, off: 960 },
        { pitch: 64, on: 0, off: 480 },
      ],
    };

    const expectedSlices: Slice[] = [
      {
        notes: [
          { pitch: 60, holdover: false },
          { pitch: 64, holdover: false },
        ],
        start: 0,
        end: 480,
      },
      {
        notes: [
          { pitch: 60, holdover: true },
          { pitch: 62, holdover: false },
        ],
        start: 480,
        end: 960,
      },
      { notes: [{ pitch: 62, holdover: true }], start: 960, end: 1440 },
      { notes: [], start: 1440, end: 1920 },
    ];

    it("creates four slices", () => {
      expect(slicer(threeNoteInput).length).toEqual(4);
    });

    it("returns correct slices", () => {
      const returnedSlices = slicer(threeNoteInput)!;
      const sortCb = (a: SliceNote, b: SliceNote) => a.pitch - b.pitch;

      for (let i = 0; i < expectedSlices.length; i++) {
        expect(returnedSlices[i].start).toEqual(expectedSlices[i].start);
        expect(returnedSlices[i].end).toEqual(expectedSlices[i].end);
        expect(returnedSlices[i].notes.toSorted(sortCb)).toEqual(
          expectedSlices[i].notes.toSorted(sortCb),
        );
      }
    });
  });

  describe("Seven notes at once", () => {
    const sevenNotesAtOnce = {
      endTick: 480,
      notes: [
        { pitch: 60, on: 0, off: 480 },
        { pitch: 61, on: 0, off: 480 },
        { pitch: 62, on: 0, off: 480 },
        { pitch: 63, on: 0, off: 480 },
        { pitch: 64, on: 0, off: 480 },
        { pitch: 65, on: 0, off: 480 },
        { pitch: 66, on: 0, off: 480 },
      ],
    };

    it("should not error", () => {
      expect(() => slicer(sevenNotesAtOnce)).not.toThrow();
    });
  });
});

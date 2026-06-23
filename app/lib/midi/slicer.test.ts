import slicer from "./slicer";

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

  describe("Two note input", () => {
    const twoNoteInput = {
      endTick: 960,
      notes: [
        { pitch: 60, on: 0, off: 480 },
        { pitch: 62, on: 480, off: 960 },
      ],
    };
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

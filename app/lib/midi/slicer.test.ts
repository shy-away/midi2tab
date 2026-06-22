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
  });
});

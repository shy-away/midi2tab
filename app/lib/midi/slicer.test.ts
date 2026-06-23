import slicer from "./slicer";

describe("Slice generator", () => {
  const dummyInput = {
    endTick: 2000,
    notes: [
      { pitch: 60, on: 10, off: 480 },
      { pitch: 60, on: 10, off: 960 },
      { pitch: 60, on: 0, off: 480 },
    ],
  };

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

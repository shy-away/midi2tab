export type SlicerInputNote = {
  pitch: number;
  on: number;
  off: number;
};

export type SlicerInput = {
  endTick: number;
  notes: SlicerInputNote[];
};

export default function slicer(input: SlicerInput) {
  return [];
}

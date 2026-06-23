export type SlicerInputNote = {
  pitch: number;
  on: number;
  off: number;
};

export type SlicerInput = {
  endTick: number;
  notes: SlicerInputNote[];
};

export type Slice = {
  notes: { pitch: number; holdover: boolean }[];
  start: number;
  end: number;
};

export default function slicer(input: SlicerInput): Slice[] {
  return [];
}

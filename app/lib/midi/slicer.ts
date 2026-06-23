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
  notes: SliceNote[];
  start: number;
  end: number;
};

export type SliceNote = {
  pitch: number;
  holdover: boolean;
};

export default function slicer({ endTick, notes }: SlicerInput): Slice[] {
  // sort by note on asc, breaking ties by note off asc
  notes.sort((a, b) => (a.on !== b.on ? a.on - b.on : a.off - b.off));

  const active: SliceNote[] = notes
    .filter((note: SlicerInputNote) => note.on === 0)
    .map(({ pitch }: SlicerInputNote) => {
      return { pitch, holdover: false };
    });

  const result = [{ notes: active, start: 0, end: endTick }];

  return result;
}

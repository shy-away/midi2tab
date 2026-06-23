import { PriorityQueue } from "@datastructures-js/priority-queue";

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
  if (notes.length === 0) {
    return [{ notes: [], start: 0, end: endTick }];
  }

  // sort by note on asc, breaking ties by note off asc
  notes.sort((a, b) => (a.on !== b.on ? a.on - b.on : a.off - b.off));

  const activePQ = new PriorityQueue<SlicerInputNote>(
    (a: SlicerInputNote, b: SlicerInputNote) => a.off - b.off,
  );

  const slices: Slice[] = [{ notes: [], start: 0, end: endTick }];

  for (let i = 0; i < notes.length; i++) {
    const currentNote = notes[i];
    const lastSlice = slices.at(-1)!;

    if (!activePQ.isEmpty() && activePQ.front()!.off <= currentNote.on) {
      // next event is note-off(s) from activePQ (or next note-off matches currentNote.on)

      const offTime = activePQ.front()!.off;

      // edge case: break at end of track
      if (offTime === endTick) break;

      // retrieve all notes that will end on this slice
      while (!activePQ.isEmpty() && activePQ.front()!.off === offTime) {
        activePQ.dequeue();
      }

      // create new slice from all remaining notes
      lastSlice.end = offTime;
      const remainingNotes = activePQ.toArray().map(({ pitch }) => {
        return { pitch, holdover: true };
      });

      slices.push({
        start: offTime,
        end: endTick,
        notes: remainingNotes,
      });

      // if end of slice matches currentNote start, defer processing currentNote to next iteration
      if (offTime === currentNote.on) i--;
    } else {
      // next event is note-on from currentNote

      // case 1: note-on starts at last slice
      if (lastSlice.start === currentNote.on) {
        // add currentNote to last slice
        lastSlice.notes.push({ pitch: currentNote.pitch, holdover: false });
      }
      // case 2: note-on starts after last slice starts
      else {
        lastSlice.end = currentNote.on;

        // all notes from last slice are held
        const newNotes: SliceNote[] = [
          ...lastSlice.notes.map(({ pitch }) => {
            return { pitch, holdover: true };
          }),
          { pitch: currentNote.pitch, holdover: false },
        ];

        slices.push({
          start: currentNote.on,
          end: endTick,
          notes: newNotes,
        });
      }

      // always enqueue newly processed currentNote
      activePQ.enqueue(currentNote);
    }
  }

  return slices;
}

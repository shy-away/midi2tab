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
  const slices: Slice[] = [{ notes: [], start: 0, end: endTick }];

  if (notes.length === 0) {
    return slices;
  }

  // sort by note on asc, breaking ties by note off asc
  notes.sort((a, b) => (a.on !== b.on ? a.on - b.on : a.off - b.off));

  const activePQ = new PriorityQueue<SlicerInputNote>(
    (a: SlicerInputNote, b: SlicerInputNote) => a.off - b.off,
  );

  /**
   * Utility to dequeue note(s) from activePQ and create new slice ending at `offTime`.
   * @param offTime Midi tick to slice up to
   */
  const processNoteOffs = (offTime: number) => {
    // edge case: early return at end of track
    if (offTime === endTick) {
      activePQ.clear();
      return;
    }

    // retrieve all notes that will end on this slice
    while (!activePQ.isEmpty() && activePQ.front()!.off === offTime) {
      activePQ.dequeue();
    }

    // create new slice from remaining notes
    slices.at(-1)!.end = offTime;

    const remainingNotes = activePQ.toArray().map(({ pitch }) => {
      return { pitch, holdover: true };
    });

    slices.push({
      start: offTime,
      end: endTick,
      notes: remainingNotes,
    });
  };

  for (let i = 0; i < notes.length; i++) {
    const currentNote = notes[i];
    const lastSlice = slices.at(-1)!;

    if (!activePQ.isEmpty() && activePQ.front()!.off <= currentNote.on) {
      // next event is note-off(s) from activePQ (or next note-off matches currentNote.on)

      const offTime = activePQ.front()!.off;
      processNoteOffs(offTime);

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

  // process remaining active notes, if any
  while (!activePQ.isEmpty()) {
    const offTime = activePQ.front()!.off;
    processNoteOffs(offTime);
  }

  return slices;
}

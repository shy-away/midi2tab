import ranker from "@/app/lib/algs/ranker";
import { Pitch } from "@/app/lib/types";
import { PriorityQueue } from "@datastructures-js/priority-queue";

export type SlicerInputNote = {
  pitch: number;
  on: number;
  off: number;
};

export type SlicerInput = {
  endTick: number;
  notes: SlicerInputNote[];
  maxConcurrentNotes?: number;
};

export type Slice = {
  notes: SliceNote[];
  start: number;
  end: number;
};

export type SliceNote = {
  pitch: Pitch;
  holdover: boolean;
};

export default function slicer({
  endTick,
  notes,
  maxConcurrentNotes = 6,
}: SlicerInput): Slice[] {
  const slices: Slice[] = [{ notes: [], start: 0, end: endTick }];

  if (notes.length === 0) {
    return slices;
  }

  notes.sort((a, b) => a.on - b.on);

  const activePQ = new PriorityQueue<SlicerInputNote>(
    (a: SlicerInputNote, b: SlicerInputNote) => a.off - b.off,
  );

  // round and clamp to range [1, 6]
  const maxActivePQSize = Math.max(
    1,
    Math.min(6, Math.round(maxConcurrentNotes)),
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

    const remainingNotes = activePQ.toArray().map(({ pitch: p }): SliceNote => {
      return { pitch: p as Pitch, holdover: true };
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

      // currentNote is at or after offTime, so defer processing currentNote to next iteration
      i--;
      continue;
    } else {
      // next event is note-on from currentNote

      // case 1: note-on starts at last slice
      if (lastSlice.start === currentNote.on) {
        // add currentNote to last slice
        lastSlice.notes.push({
          pitch: currentNote.pitch as Pitch,
          holdover: false,
        });
      }
      // case 2: note-on starts after last slice starts
      else {
        lastSlice.end = currentNote.on;

        // all notes from last slice are held
        const newNotes: SliceNote[] = [
          ...lastSlice.notes.map((note) => {
            return { ...note, holdover: true };
          }),
          { pitch: currentNote.pitch as Pitch, holdover: false },
        ];

        slices.push({
          start: currentNote.on,
          end: endTick,
          notes: newNotes,
        });
      }

      // always enqueue newly processed currentNote
      activePQ.enqueue(currentNote);

      // rank and filter if activePQ size exceeds limit
      if (activePQ.size() > maxActivePQSize) {
        // re-fetch last slice
        const lastSlice = slices.at(-1)!;

        const rankedNotes = ranker(lastSlice.notes);

        // replace notes of last slice with top notes within limit
        lastSlice.notes = rankedNotes.slice(0, maxActivePQSize);
      }
    }
  }

  // process remaining active notes, if any
  while (!activePQ.isEmpty()) {
    const offTime = activePQ.front()!.off;
    processNoteOffs(offTime);
  }

  return slices;
}

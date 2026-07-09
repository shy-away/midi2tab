import { Chord, Fret, GuitarString } from "@/app/lib/algs/chord-finder";
import { Slice } from "@/app/lib/algs/slicer";
import { defaultTuning, Tuning } from "@/app/lib/tunings";
import { midiToNoteName } from "@tonaljs/midi";

export type alphatexOptions = {
  ppq: number;
  tuning: Tuning;
  title?: string;
  capo?: Fret;
  timeSigTop?: number;
  timeSigBottom?: number;
};

export default function alphatexGenerator(
  slices: Slice[],
  chords: Chord[],
  {
    ppq,
    title,
    tuning,
    capo = 0,
    timeSigTop = 4,
    timeSigBottom = 4,
  }: alphatexOptions,
): string {
  const texArr: string[] = [];

  /* Metadata */

  if (!title || title === "") title = "Untitled";
  texArr.push(`\\title "${title}"`);

  if (tuning !== defaultTuning) {
    const pitches = tuning.pitches.map((p) =>
      midiToNoteName(p, { sharps: true }),
    );

    texArr.push(`\\tuning (${pitches.join(" ")}) { label "${tuning.name}" }`);
  }

  if (capo > 0) {
    texArr.push(`\\capo ${capo}`);
  }

  texArr.push(`\\ts ${timeSigTop} ${timeSigBottom}`);

  /* Intermediate chunking */

  const pulsesPerBeat = (ppq * 4) / timeSigBottom;
  const pulsesPerMeasure = pulsesPerBeat * timeSigTop;
  let measurePulsesUsed = 0;

  const chunks: {
    pulses: number;
    notes: { guitarString: GuitarString; fret: Fret; holdover: boolean }[];
  }[] = [];

  const validChunkSizes: number[] = [];
  for (let s = ppq * 4; s >= ppq / 4; s = s / 2) validChunkSizes.push(s);

  function greedyChunker(pulses: number): number[] {
    const chunkSizes: number[] = [];

    let remainingPulses = pulses;
    let i = 0;

    while (remainingPulses > 0 && i < validChunkSizes.length) {
      if (validChunkSizes[i] <= remainingPulses) {
        chunkSizes.push(validChunkSizes[i]);
        remainingPulses -= validChunkSizes[i];
      } else i++;
    }

    if (remainingPulses > 0)
      throw Error(
        `Invalid chunk size encountered.
        PPQ: ${ppq}
        Initial chunk size: ${pulses}
        Remaining pulses: ${remainingPulses}`,
      );

    return chunkSizes;
  }

  for (let i = 0; i < slices.length; i++) {
    const currentChord = chords[i];
    const currentSlice = slices[i];

    const slicePulses = currentSlice.end - currentSlice.start;
    let chunkSizes: number[];

    // get chunk sizes, ensuring split over barlines
    if (slicePulses <= pulsesPerMeasure - measurePulsesUsed) {
      chunkSizes = greedyChunker(slicePulses);
    } else {
      const pulseOverflow = measurePulsesUsed + slicePulses - pulsesPerMeasure;
      chunkSizes = [
        ...greedyChunker(slicePulses - pulseOverflow),
        ...greedyChunker(pulseOverflow),
      ];
    }

    // update progress through current measure
    measurePulsesUsed = (measurePulsesUsed + slicePulses) % pulsesPerMeasure;

    // create chunks
    for (let j = 0; j < chunkSizes.length; j++) {
      // on first chunk, use holdover flags from currentChord
      if (j === 0) {
        chunks.push({
          pulses: chunkSizes[j],
          notes: currentChord.fingering.map(
            ({ guitarString, fret, holdover }) => ({
              guitarString,
              fret,
              holdover,
            }),
          ),
        });
      }

      // on subsequent chunks, all notes are holdovers
      else {
        chunks.push({
          pulses: chunkSizes[j],
          notes: currentChord.fingering.map(({ guitarString, fret }) => ({
            guitarString,
            fret,
            holdover: true,
          })),
        });
      }
    }
  }

  // console.log(JSON.stringify(chunks, undefined, 2));

  /* alphaTex generation */

  measurePulsesUsed = 0;

  for (let i = 0; i < chunks.length; i++) {
    const currentChunk = chunks[i];
    const texDuration = 4 * (ppq / currentChunk.pulses);

    let texContent: string;

    if (currentChunk.notes.length > 0) {
      const texNotes = currentChunk.notes.map(
        ({ guitarString, fret, holdover }) =>
          `${holdover ? "-" : fret}.${guitarString + 1}`,
      );

      texContent = `(${texNotes.join(" ")})`;
    } else {
      texContent = "r";
    }

    texArr.push(`:${texDuration} ${texContent}`);

    measurePulsesUsed += currentChunk.pulses;

    if (measurePulsesUsed === pulsesPerMeasure) {
      texArr.push("|");
      measurePulsesUsed = 0;
    }
  }

  return texArr.join("\n");
}

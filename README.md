# Midi2Tab

Generate guitar tablature from MIDI. [Deployed using Vercel.](https://midi2tab.vercel.app/)

## Credits

For MIDI file sources, see [`ATTRIBUTION.md`](ATTRIBUTION.md).

Additionally, this project wouldn't have been possible without:

- [AlphaTab](https://www.alphatab.net/) to display tablature alongside standard musical notation
- [Tone.js](https://tonejs.github.io/) and [Tonal](https://tonaljs.github.io/tonal/) for MIDI parsing utilities
- [Steinberg's Bravura fonts](https://github.com/steinbergmedia/bravura) for music notation (used by AlphaTab), generously provided under the SIL Open Font License
- [Next Icons](https://www.nexticons.com/) for the GitHub icon in the footer
- [shadcn/studio](https://shadcnstudio.com/), for their "Input with plus/minus buttons" component (this project uses a modified version of their demo)
- [datastructures-js](https://datastructures-js.info/) and [js-combinatorics](https://github.com/dankogai/js-combinatorics) for certain algorithmic functions
- The many brilliant people behind every part of this app's tech stack: React, TypeScript, Next.js, shadcn/ui, Tailwind, Zod, Jest, and many more.

# Development

To run a local development server, use the `dev` script.

```
npm run dev
```

# Technical Overview

The following is the general outline of how the MIDI &rarr; guitar TAB transformation takes place.

1. **Initial upload.** The user uploads their MIDI and form data to the server. The form data is validated against a Zod schema. If all goes well, the MIDI file is read by `@tonejs/midi` and analyzed. Transposition is determined and applied.
   - All tracks of the MIDI file are squashed. Where this creates any pair of overlapping notes, the second note is removed.
2. **Slicer.** The slicer sorts incoming notes by onset, then traverses them to create slices. A slice represents a length of time in which no notes change; slices are separated by the change of any note (a note-on or note-off). Using a priority queue to dynamically track which notes are "active" at any time, the slicer transforms the notes into a sequence of slices.
   - If there are too many notes at once (more than 6 or Max Notes At Once, whichever is less), the notes are ranked and filtered.
   - **NB:** A note in a slice may either start on that slice, or may be _held over_ from the previous slice. Every following step must handle this.
3. **Chord finder.** The chord finder creates multiple chord options for every slice. Given user constraints (Tuning, Capo, Min Fret, Max Fret, Hand Span), it finds all possible guitar string/fret placements for each pitch, generates valid guitar voicings, and assigns fingers. Every chord also has an estimated playing difficulty.
   - The chord finder ranks notes and dynamically drops the least important notes until valid chord options are found. This may be done after generating placements, voicings, or fingerings, if any step finds zero options.
   - Every iteration of the chord finder communicates _forward_ what pitches were used in its chord options. This is used to ensure that any chord from `slices[i]` is compatible with any chord from `slices[i-1]`.
4. **Song pathfinder.** Now that each slice has multiple ways to be played, the song pathfinder weaves through the chord options to find the easiest path. This uses a simplified Viterbi algorithm.<sup id="r1">[[1]](#f1)</sup><sup id="r2">[[2]](#f2)</sup>
   - Typical Viterbi implementations use a probability model, but in my song pathfinder, a transition cost function defines the _cost_ of moving from any chord to any other chord. This is used in conjunction with the individual chords' estimated playing difficulty to direct the Viterbi pathfinding.
   - An extra step at the end sanitizes improperly held notes.
5. **AlphaTex generator.** Using the song, slices, and other user options (Tuning, Capo, Time Signature), the alphaTex generator traverses the song's chords and outputs alphaTex that will be rendered by AlphaTab on the client. This is facilitated by an intermediate "chunking" step.
   - The title is the name of the MIDI file.
   - The "chunking" uses a simple greedy algorithm to ensure each chunk is representable in standard notation (though this can produce un-musical results). It at least controls the correct placement of bar lines.

<a id="f1" href="#r1">[1]</a>: For an explanation of the general approach, I recommend https://en.wikipedia.org/wiki/Viterbi_algorithm. The main simplification in my song pathfinder is that the "hidden" states of the HMM are _among_ the observations. At any point (slice), one of the observations (chords) _is itself part of_ the most probable sequence of "hidden" states (the song).

<a id="f2" href="#r2">[2]</a>: For a simpler-to-follow introduction to the implementation of a Viterbi algorithm, I found this article by Neri Van Otten helpful: https://spotintelligence.com/2025/06/02/viterbi-algorithm-made-simple-how-to-worked-out-examples/#Introduction

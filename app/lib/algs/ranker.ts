export default function ranker<T extends { pitch: number; holdover: boolean }>(
  inputNotes: T[],
) {
  // sort input notes by pitch descending
  const sortedInputNotes = inputNotes.toSorted((a, b) => b.pitch - a.pitch);

  // list indices alternating highest, lowest, next-highest, etc.
  const indices = [];
  let lo = 0;
  let hi = sortedInputNotes.length - 1;
  let pushLo: boolean = true;

  while (lo <= hi) {
    if (pushLo) {
      indices.push(lo++);
    } else {
      indices.push(hi--);
    }

    pushLo = !pushLo;
  }

  // filter by holdover
  const holdovers = [];
  const nonHoldovers = [];

  for (let j = 0; j < sortedInputNotes.length; j++) {
    const currentActiveNote = sortedInputNotes[indices[j]];

    if (currentActiveNote.holdover) {
      holdovers.push(currentActiveNote);
    } else {
      nonHoldovers.push(currentActiveNote);
    }
  }

  // reconsolidate notes
  return [...nonHoldovers, ...holdovers];
}

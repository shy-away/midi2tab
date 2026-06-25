/**
 * Helper type to enumerate integers [0, `Count`).
 */
export type Enumerator<Count extends number, Acc extends number[]> = Acc["length"] extends Count
  ? Acc[number]
  : Enumerator<Count, [...Acc, Acc["length"]]>;
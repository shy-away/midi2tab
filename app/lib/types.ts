/**
 * Helper type to enumerate integers [0, `Count`).
 */
export type Enumerator<
  Count extends number,
  Acc extends number[],
> = Acc["length"] extends Count
  ? Acc[number]
  : Enumerator<Count, [...Acc, Acc["length"]]>;

type MinPitch = 38; // D2, string 6 fret 0 in drop D
type MaxPitch = 89; // E6, string 0 fret 24 in E standard, *+1 for exclusive range*

/**
 * Integers in range [38, 88], or D2 to E6.
 */
export type Pitch = Exclude<Enumerator<MaxPitch, []>, Enumerator<MinPitch, []>>;

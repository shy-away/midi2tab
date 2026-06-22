type TimeSig = {
  top: number;
  bottom: number;
};

export const commonTimeSigs: TimeSig[] = [
  {
    top: 4,
    bottom: 4,
  },
  {
    top: 3,
    bottom: 4,
  },
  {
    top: 6,
    bottom: 8,
  },
];

export function getTimeSigString(timeSig: TimeSig): string {
  return timeSig.top + "/" + timeSig.bottom;
}

import alphatexGenerator from "@/app/lib/algs/alphatex-generator";
import { tunings, defaultTuning } from "@/app/lib/tunings";

describe("alphaTex generator", () => {
  it("preserves the provided title in the metadata", () => {
    const output = alphatexGenerator([], [], {
      ppq: 480,
      title: "My Song",
      tuning: defaultTuning,
    });

    expect(output).toContain('\\title "My Song"');
  });

  it("uses Untitled when no title is provided", () => {
    const output = alphatexGenerator([], [], {
      ppq: 480,
      tuning: defaultTuning,
    });

    expect(output).toContain('\\title "Untitled"');
  });

  it("uses Untitled when the title is an empty string", () => {
    const output = alphatexGenerator([], [], {
      ppq: 480,
      title: "",
      tuning: defaultTuning,
    });

    expect(output).toContain('\\title "Untitled"');
  });
  it("includes capo and time signature metadata in the expected format", () => {
    const output = alphatexGenerator([], [], {
      ppq: 480,
      title: "Metadata Song",
      tuning: defaultTuning,
      capo: 3,
      timeSigTop: 3,
      timeSigBottom: 8,
    });

    expect(output).toContain('\\title "Metadata Song"');
    expect(output).toContain("\\capo 3");
    expect(output).toContain("\\ts 3 8");
  });

  it("includes tuning metadata for a non-default tuning", () => {
    const output = alphatexGenerator([], [], {
      ppq: 480,
      title: "Drop D Song",
      tuning: tunings[1],
    });

    expect(output).toMatch(/\\tuning \(.+\) \{ label "Drop D" \}/);
  });

  it("omits tuning metadata when the tuning is the default tuning", () => {
    const output = alphatexGenerator([], [], {
      ppq: 480,
      title: "Default Tuning Song",
      tuning: defaultTuning,
    });

    expect(output).not.toContain("\\tuning ");
  });
});

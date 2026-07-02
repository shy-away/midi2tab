import alphatexGenerator from "@/app/lib/algs/alphatex-generator";
import { tunings } from "@/app/lib/tunings";

describe("alphaTex generator", () => {
  it("exists", () => {
    expect(alphatexGenerator).toBeDefined();
    console.log(alphatexGenerator([], [], { title: "test title", tuning: tunings[1] }));
  });
});

"use client";

import { convertMidiToTab, State } from "@/app/lib/actions";
import styles from "@/app/styles/barberpole-bg.module.scss";
import MidiInput from "@/app/ui/midi-input";
import { Button } from "@/components/ui/button";
import { AlphaTabApi } from "@coderline/alphatab";
import { useActionState, useEffect, useRef, useState } from "react";

export default function Home() {
  const [showOutput, setShowOutput] = useState(false);
  const texRef = useRef<HTMLDivElement | null>(null);

  const action = async (_: object, formData: FormData): Promise<State> => {
    setShowOutput(true);
    return convertMidiToTab(formData);
  };

  const [state, formAction] = useActionState(action, {});

  useEffect(() => {
    if (!texRef.current || !state.tex) return;

    const api = new AlphaTabApi(texRef.current, {
      core: {
        fontDirectory: "/font/",
        useWorkers: false,
      },
      notation: {
        elements: new Map([
          ["tracknames", false],
          ["barnumber", false],
          ["effectdynamics", false],
        ]),
      },
    });

    api.tex(state.tex);

    return () => api.destroy();
  }, [state]);

  return (
    <div
      className={`${styles.barberpoleBg} grow min-h-full flex flex-col items-center pb-4`}
    >
      {!showOutput ? (
        <>
          <HomepageSection>
            <MidiInput action={formAction} />
          </HomepageSection>
          <HomepageSection>
            {
              // TODO: add presets
            }
          </HomepageSection>
        </>
      ) : (
        <HomepageSection>
          <div className="flex flex-col justify-center items-center gap-3">
            {state.error ? (
              <div>{state.error}</div>
            ) : (
              <div className="min-w-12/12 bg-white" ref={texRef}></div>
            )}
            <Button onClick={() => setShowOutput(false)}>Go Back</Button>
          </div>
        </HomepageSection>
      )}
    </div>
  );
}

function HomepageSection({ children }: { children?: React.ReactNode }) {
  return (
    <div className="mt-3 w-11/12 md:w-8/12 lg:max-w-200 rounded-3xl border-2 p-5 backdrop-blur-xs">
      {children}
    </div>
  );
}

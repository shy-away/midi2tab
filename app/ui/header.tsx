import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CircleQuestionMarkIcon } from "lucide-react";

export default function Header({
  className,
}: {
  className: string;
}): React.ReactNode {
  return (
    <nav className={`${className} flex items-center p-3 border-b-2`}>
      <span id="name" className="mr-auto text-xl sm:text-2xl">
        Midi2Tab
      </span>
      <Dialog>
        <DialogTrigger>
          <CircleQuestionMarkIcon />
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Guide</DialogTitle>
          </DialogHeader>
          <div className="mx-4 max-h-[50vh] overflow-y-auto px-4">
            <p className="mb-2">
              <span className="font-bold">Welcome!</span> This tool converts
              MIDI files into guitar tablature.
            </p>
            <p className="mb-2">
              You can upload your own MIDI, or try a preset.
            </p>
            <span className="font-bold">Quick start:</span>
            <ul className="list-disc list-inside">
              <li>Upload your MIDI file.</li>
              <li>
                Configure options.
                <ul className="list-[circle] ml-6 mt-1">
                  <li>
                    Model your guitar with{" "}
                    <span className="font-bold">Tuning and Capo</span>.
                  </li>
                  <li>
                    Control the conversion with{" "}
                    <span className="font-bold">
                      Min Fret, Max Fret, Hand Span, and Max Notes At Once
                    </span>
                    .
                  </li>
                  <li>
                    Set the time signature as desired. Use the manual{" "}
                    <span className="font-bold">Transpose</span> option, or try
                    the <span className="font-bold">Auto-transpose</span> option
                    to let the algorithm adjust the pitch.
                  </li>
                </ul>
              </li>
              <li>
                Hit <span className="font-bold">Submit</span> to convert!
              </li>
            </ul>
          </div>
        </DialogContent>
      </Dialog>
    </nav>
  );
}

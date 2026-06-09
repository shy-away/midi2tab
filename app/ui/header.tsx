import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CircleQuestionMarkIcon } from "lucide-react";

export default function Header(): React.ReactNode {
  return (
    <nav className="flex items-center p-3 border-b-2">
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
            {
              // TODO: Remove placeholder
            }
            {Array(5)
              .fill(0)
              .map((_, index) => (
                <p key={index} className="mb-4 leading-normal">
                  Lorem, ipsum dolor sit amet consectetur adipisicing elit.
                  Praesentium magni nostrum ea qui. Praesentium sunt quis atque
                  debitis quos adipisci facilis autem sit tenetur! Mollitia
                  possimus eveniet dignissimos quo numquam? Alias sunt
                  perspiciatis ex facilis veniam nemo eligendi nam, dolorum
                  distinctio corporis? Vel ullam vero iure quos, mollitia atque
                  omnis.
                </p>
              ))}
          </div>
        </DialogContent>
      </Dialog>
    </nav>
  );
}

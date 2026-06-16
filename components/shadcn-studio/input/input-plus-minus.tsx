"use client";

import {
  Button,
  Group,
  Input,
  NumberField,
  NumberFieldProps,
} from "react-aria-components";
import { MinusIcon, PlusIcon } from "lucide-react";

const InputWithPlusMinusButtons = (props: NumberFieldProps) => {
  return (
    <NumberField {...props} className="w-full max-w-xs space-y-2">
      <Group className="border-input data-focus-within:border-ring data-focus-within:ring-ring/50 data-focus-within:has-aria-invalid:border-destructive data-focus-within:has-aria-invalid:ring-destructive/20 dark:bg-input/30 dark:data-focus-within:has-aria-invalid:ring-destructive/40 relative inline-flex h-8 w-full min-w-0 items-center overflow-hidden rounded-lg border bg-transparent text-base whitespace-nowrap transition-colors outline-none data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:opacity-50 data-focus-within:ring-3 md:text-sm">
        <Button
          slot="decrement"
          className="border-input bg-background text-muted-foreground hover:bg-muted hover:text-foreground -ms-px flex aspect-square h-[inherit] items-center justify-center rounded-l-lg border text-sm transition-colors disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          <MinusIcon className="size-4" />
          <span className="sr-only">Decrement</span>
        </Button>
        <Input className="selection:bg-primary selection:text-primary-foreground w-full grow px-2.5 py-1 text-center tabular-nums outline-none" />
        <Button
          slot="increment"
          className="border-input bg-background text-muted-foreground hover:bg-muted hover:text-foreground -me-px flex aspect-square h-[inherit] items-center justify-center rounded-r-lg border text-sm transition-colors disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          <PlusIcon className="size-4" />
          <span className="sr-only">Increment</span>
        </Button>
      </Group>
    </NumberField>
  );
};

export default InputWithPlusMinusButtons;

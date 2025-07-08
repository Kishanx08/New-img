import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className,
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-gradient-to-r from-teal-400 via-amber-500 to-yellow-600/80 shadow-inner">
      <SliderPrimitive.Range className="absolute h-full bg-gradient-to-r from-teal-500 to-amber-600" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-6 w-6 rounded-full border-2 border-white dark:border-green-400 bg-white/80 dark:bg-green-900 shadow-lg ring-2 ring-teal-300/40 transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-400/60 focus-visible:ring-offset-2 active:scale-110 active:shadow-2xl focus:scale-110 focus:shadow-2xl disabled:pointer-events-none disabled:opacity-50" />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };

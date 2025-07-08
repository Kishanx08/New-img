import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

// FloatingInput: floating label, optional icon, pill shape, gradient border on focus
interface FloatingInputProps extends React.ComponentProps<"input"> {
  label: string;
  icon?: React.ReactNode;
}

const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ label, icon, className, type, id, value, onChange, ...props }, ref) => {
    const [focused, setFocused] = React.useState(false);
    const hasValue = value !== undefined && value !== "";
    return (
      <div className="relative w-full mb-2">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {icon}
          </span>
        )}
        <input
          id={id}
          ref={ref}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={cn(
            `peer block w-full rounded-full bg-blue-50 border border-gray-200 px-10 py-3 text-base text-gray-900 transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 placeholder-transparent
            ${icon ? 'pl-10' : 'pl-4'}
            `,
            focused || hasValue ? 'border-teal-400 ring-2 ring-teal-200' : '',
            className
          )}
          placeholder=" "
          {...props}
        />
        <label
          htmlFor={id}
          className={cn(
            `absolute left-4 top-1/2 -translate-y-1/2 bg-blue-50 px-1 text-gray-500 pointer-events-none transition-all duration-200
            peer-focus:-top-2 peer-focus:left-4 peer-focus:text-xs peer-focus:text-teal-600
            ${hasValue ? '-top-2 left-4 text-xs text-teal-600' : ''}
            `,
            icon ? 'left-10' : 'left-4'
          )}
        >
          {label}
        </label>
      </div>
    );
  }
);
FloatingInput.displayName = "FloatingInput";

export { Input, FloatingInput };

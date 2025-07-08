import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast rounded-xl border p-6 pr-8 shadow-xl transition-all backdrop-blur-md bg-white/80 dark:bg-black/80 border-gray-200 dark:border-green-900/60 text-gray-900 dark:text-green-100",
          description: "text-sm opacity-90 mt-1 group-[.toast]:text-muted-foreground",
          actionButton:
            "bg-gradient-to-r from-teal-500 to-amber-500 text-white font-semibold rounded px-3 py-1 shadow hover:from-teal-600 hover:to-amber-600 transition-all",
          cancelButton:
            "bg-gray-200 dark:bg-green-900 text-gray-700 dark:text-green-100 rounded px-3 py-1",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };

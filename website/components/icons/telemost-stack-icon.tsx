import { cn } from "@/lib/utils";
import { TelemostLogoIcon } from "./logotypes/telemost-logo-icon";

export function TelemostStackIcon({
  className,
  ringClass = "ring-(--primary)",
}: {
  className?: string;
  ringClass?: string;
}) {
  return (
    <div className={cn("flex items-center -space-x-2.5", className)}>
      {[0].map((i) => (
        <div
          key={i}
          className={cn(
            "size-8 sm:size-6 rounded-full bg-[#6DEAA1] flex items-center justify-center",
            ringClass,
          )}
          style={{ zIndex: 3 - i }}
        >
          <TelemostLogoIcon className="[&>*]:fill-[#000] size-7! sm:size-5!" />
        </div>
      ))}
    </div>
  );
}

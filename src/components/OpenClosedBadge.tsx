import { getOpenStatus } from "@/lib/hours";
import type { BusinessSettings } from "@/lib/types";

type Props = {
  settings: BusinessSettings;
};

export function OpenClosedBadge({ settings }: Props) {
  const status = getOpenStatus(settings);

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium ${
        status.isOpen
          ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30"
          : "bg-zinc-500/15 text-zinc-300 ring-1 ring-zinc-500/30"
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${
          status.isOpen ? "bg-emerald-400" : "bg-zinc-400"
        }`}
      />
      {status.message}
    </div>
  );
}

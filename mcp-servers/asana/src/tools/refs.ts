export function taskGidArg(arg: unknown): string {
  if (typeof arg === "string" && arg.trim() !== "") return arg.trim();
  if (typeof arg === "number" && Number.isFinite(arg) && arg > 0) return String(arg);
  throw new Error("id must be a non-empty Asana task GID");
}

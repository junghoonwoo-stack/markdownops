export function issueRefArg(arg: unknown): string {
  if (typeof arg === "string" && arg.trim() !== "") return arg.trim();
  if (typeof arg === "number" && Number.isFinite(arg)) return String(arg);
  throw new Error("id must be a non-empty string identifier or UUID");
}

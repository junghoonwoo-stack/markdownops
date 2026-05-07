export function issueRefArg(arg: unknown): string {
  if (typeof arg === "number" && Number.isFinite(arg) && arg > 0) return String(arg);
  if (typeof arg === "string" && arg.trim() !== "") return arg.trim();
  throw new Error("id must be a positive integer or an issue key like PROJ-123");
}

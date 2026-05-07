export function pageIdArg(arg: unknown): string {
  if (typeof arg !== "string" || arg.trim() === "") {
    throw new Error("id must be a non-empty Notion page UUID");
  }
  return arg.trim();
}

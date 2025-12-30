export function assertString(x, name = "value") {
  if (typeof x !== "string") throw new Error(`${name} must be a string`);
}

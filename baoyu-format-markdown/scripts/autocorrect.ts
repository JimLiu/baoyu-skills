import { execSync } from "child_process";

export function applyAutocorrect(filePath: string): boolean {
  try {
    execSync(`npx autocorrect-node --fix "${filePath}"`, { stdio: "inherit" });
    return true;
  } catch {
    return false;
  }
}

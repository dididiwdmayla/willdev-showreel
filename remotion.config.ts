/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import fs from "node:fs";
import path from "node:path";
import { Config } from "@remotion/cli/config";

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(95);
Config.setOverwriteOutput(true);
Config.setDefaultPremountInSeconds(2);

// Remotion downloads its own Chrome Headless Shell. Where that download is
// blocked, use REMOTION_BROWSER or a Playwright headless shell if one exists.
const findPlaywrightShell = (): string | null => {
  const root = process.env.PLAYWRIGHT_BROWSERS_PATH ?? "/opt/pw-browsers";
  if (!fs.existsSync(root)) return null;
  for (const dir of fs.readdirSync(root).filter((d) => d.startsWith("chromium_headless_shell")).sort().reverse()) {
    for (const sub of fs.readdirSync(path.join(root, dir))) {
      const exe = path.join(root, dir, sub, "chrome-headless-shell");
      if (fs.existsSync(exe)) return exe;
    }
  }
  return null;
};
const browser = process.env.REMOTION_BROWSER ?? findPlaywrightShell();
if (browser) Config.setBrowserExecutable(browser);

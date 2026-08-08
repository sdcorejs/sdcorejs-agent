/**
 * Cross-platform browser launcher for the Visual Companion.
 *
 * The companion URL carries the session key, so the launcher never hands it to
 * a shell. Every platform branch executes a concrete program with an argument
 * vector; there is no `shell: true`, no string interpolation into a command
 * line, and no `cmd /c start`, whose quoting rules would turn `&` inside a
 * query string into a command separator.
 *
 * Failing to open a browser is never fatal. The caller still holds the URL and
 * can present it, so this module reports a structured refusal instead of
 * throwing.
 */

import { spawn as spawnProcess } from 'node:child_process';

/** Only a loopback-or-explicit HTTP origin is ever launchable. */
const LAUNCHABLE_URL = /^https?:\/\/[^\s"'<>\\^`{|}]+$/u;
const CONTROL_CHARACTERS = /[\u0000-\u0020\u007f]/u;

export const LAUNCH_REASONS = Object.freeze({
  DISABLED: 'auto-open disabled by the caller',
  UNSAFE_URL: 'refusing to launch a URL that is not a plain http origin',
  UNSUPPORTED_PLATFORM: 'no known browser launcher for this platform',
  SPAWN_FAILED: 'the platform browser launcher could not be started',
});

/**
 * Resolve the launcher program for a platform.
 *
 * Windows uses `rundll32 url.dll,FileProtocolHandler` rather than `start`
 * because it takes the URL as a single argv entry, so an ampersand in the query
 * string cannot be reinterpreted.
 */
export function resolveLaunchCommand(url, platform = process.platform) {
  if (platform === 'win32') {
    return { command: 'rundll32.exe', args: ['url.dll,FileProtocolHandler', url] };
  }
  if (platform === 'darwin') {
    return { command: 'open', args: [url] };
  }
  if (['linux', 'freebsd', 'openbsd', 'netbsd', 'sunos', 'aix'].includes(platform)) {
    return { command: 'xdg-open', args: [url] };
  }
  return null;
}

export function isLaunchableUrl(url) {
  const value = String(url ?? '');
  if (value.length === 0 || value.length > 2048) return false;
  if (CONTROL_CHARACTERS.test(value)) return false;
  if (value.startsWith('-')) return false;
  return LAUNCHABLE_URL.test(value);
}

/**
 * Open a URL in the user's default browser.
 *
 * Returns a plain result. `opened: true` means the launcher process was
 * started, not that a browser window is visible, because no platform reports
 * that reliably.
 */
export function openInBrowser(url, { platform = process.platform, spawn = spawnProcess, enabled = true } = {}) {
  if (!enabled) {
    return { opened: false, reason: LAUNCH_REASONS.DISABLED, command: null };
  }
  if (!isLaunchableUrl(url)) {
    return { opened: false, reason: LAUNCH_REASONS.UNSAFE_URL, command: null };
  }
  const resolved = resolveLaunchCommand(url, platform);
  if (!resolved) {
    return { opened: false, reason: LAUNCH_REASONS.UNSUPPORTED_PLATFORM, command: null };
  }
  try {
    const child = spawn(resolved.command, resolved.args, {
      detached: true,
      stdio: 'ignore',
      windowsHide: true,
    });
    // A launcher failure surfaces asynchronously; swallow it so an unhandled
    // error event cannot take down the caller after it already reported.
    if (typeof child?.on === 'function') child.on('error', () => {});
    if (typeof child?.unref === 'function') child.unref();
    return { opened: true, reason: null, command: resolved.command };
  } catch {
    return { opened: false, reason: LAUNCH_REASONS.SPAWN_FAILED, command: resolved.command };
  }
}

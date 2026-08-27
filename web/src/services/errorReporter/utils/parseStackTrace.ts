/**
 * Parses raw error stack strings into structured Sentry-compatible stack frames.
 */
export function parseStackTrace(stack?: string):
  | {
      frames: {
        function: string;
        filename: string;
        lineno?: number;
        colno?: number;
        in_app: boolean;
      }[];
    }
  | undefined {
  if (!stack) return undefined;
  const lines = stack.split('\n').slice(1);
  const frames = lines
    .map((line) => {
      const match = line.match(/^\s*at\s+(?:(.+?)\s+\()?(?:(.+?):(\d+):(\d+)|([^)]+))\)?/);
      if (!match) return null;
      return {
        function: match[1] || '<anonymous>',
        filename: match[2] || match[5] || 'unknown',
        lineno: match[3] ? parseInt(match[3], 10) : undefined,
        colno: match[4] ? parseInt(match[4], 10) : undefined,
        in_app: !(match[2] || '').includes('node_modules'),
      };
    })
    .filter(Boolean) as {
    function: string;
    filename: string;
    lineno?: number;
    colno?: number;
    in_app: boolean;
  }[];

  return frames.length > 0 ? { frames } : undefined;
}

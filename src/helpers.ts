export const cn = (...classNames: any[]) => {
  let merged = '';

  for (const className of classNames) {
    if (className) merged += ' ' + className;
  }

  return merged;
};

export function validateTeamSettings(teamName: string, teamURL: string) {
  if (!teamName.trim().length) {
    return 'Team name cannot be empty.';
  }

  if (!teamURL.trim().length) {
    return 'Team URL cannot be empty.';
  }

  if (!/^[a-z0-9_-]+$/i.test(teamURL)) {
    return 'Team URL can only contain characters A-Z, 0-9, -, and _.';
  }
}

export function hexToRgb(hex: string) {
  const parsed = hex.match(/^#([a-zA-Z0-9]{2})([a-zA-Z0-9]{2})([a-zA-Z0-9]{2})$/);

  if (!parsed) return [0, 0, 0];

  return [parseInt(parsed[1], 16), parseInt(parsed[2], 16), parseInt(parsed[3], 16)];
}

// https://gist.github.com/mjackson/5311256
export function rgbToHsl(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;

  let max = Math.max(r, g, b);
  let min = Math.min(r, g, b);

  let h = 0;
  let s;
  let l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }

    h /= 6;
  }

  return [h, s, l];
}

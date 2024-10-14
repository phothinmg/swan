import boxen from "boxen";
import type { Options } from "boxen";
/**
 * Returns a function that applies ANSI color codes to a given text string.
 *
 * @param {number} a - The ANSI color code for the start of the text.
 * @param {number} b - The ANSI color code for the end of the text.
 * @return {function(string): string} - A function that takes a text string and applies the ANSI color codes to it.
 */
export function tcolor(a: number, b: number): (arg0: string) => string {
  const startCode = `\x1b[${a}m`;
  const endCode = `\x1b[${b}m`;

  return (text) => {
    if (text === null || text === undefined) {
      return text;
    }

    const endIndex = text.indexOf(endCode);
    if (endIndex === -1) {
      return startCode + text + endCode;
    }

    const parts = [
      startCode,
      text.slice(0, endIndex),
      endCode,
      text.slice(endIndex + endCode.length),
    ];
    return parts.join("");
  };
}

/**
 *
 *
 * Inspired by :  https://github.com/lukeed/kleur
 *
 * Dependency "npm:boxen"
 *
 * */

class Ticolor {
  constructor() {}

  /* Colors */
  get red() {
    return tcolor(31, 39);
  }
  get black() {
    return tcolor(30, 39);
  }
  get green() {
    return tcolor(32, 39);
  }
  get yellow() {
    return tcolor(33, 39);
  }
  get blue() {
    return tcolor(34, 39);
  }
  get magenta() {
    return tcolor(35, 39);
  }
  get cyan() {
    return tcolor(36, 39);
  }
  get white() {
    return tcolor(37, 39);
  }
  get gray() {
    return tcolor(90, 39);
  }
  get grey() {
    return tcolor(90, 39);
  }
  get brightRed() {
    return tcolor(91, 39);
  }
  get brightGreen() {
    return tcolor(92, 39);
  }
  get brightYellow() {
    return tcolor(93, 39);
  }
  get brightBlue() {
    return tcolor(94, 39);
  }
  get brightMagenta() {
    return tcolor(95, 39);
  }
  get brightCyan() {
    return tcolor(96, 39);
  }
  get brightWhite() {
    return tcolor(97, 39);
  }
  /* Background Colors */
  get bgBlack() {
    return tcolor(40, 49);
  }
  get bgRed() {
    return tcolor(41, 49);
  }
  get bgGreen() {
    return tcolor(42, 49);
  }
  get bgYellow() {
    return tcolor(43, 49);
  }
  get bgMagenta() {
    return tcolor(45, 49);
  }
  get bgBlue() {
    return tcolor(44, 49);
  }
  get bgCyan() {
    return tcolor(46, 49);
  }
  get bgWhite() {
    return tcolor(47, 49);
  }
  get bgBrightRed() {
    return tcolor(101, 49);
  }
  get bgBrightGreen() {
    return tcolor(102, 49);
  }
  get bgBrightYellow() {
    return tcolor(103, 49);
  }
  get bgBrightBlue() {
    return tcolor(104, 49);
  }
  get bgBrightMagenta() {
    return tcolor(105, 49);
  }
  get bgBrightCyan() {
    return tcolor(106, 49);
  }
  get bgBrightWhite() {
    return tcolor(107, 49);
  }

  /* Text Styles */
  get reset() {
    return tcolor(0, 0);
  }
  get bold() {
    return tcolor(1, 22);
  }
  get dim() {
    return tcolor(2, 22);
  }
  get italic() {
    return tcolor(3, 23);
  }
  get underline() {
    return tcolor(4, 24);
  }
  get inverse() {
    return tcolor(7, 27);
  }
  get hidden() {
    return tcolor(8, 28);
  }
  get strikethrough() {
    return tcolor(9, 29);
  }
}

/**
 * Terminal styles for Nyein Js.
 * ---
 *
 *
 * ***
 * <br/>
 *
 * ```js
 * import ticolor from 'ticolor';
 * import {red, bgBrightBlue, bold} from 'ticolor';
 *
 * console.log(ticolor.bgBlue(ticolor.italic(ticolor.white("Hello Mom!"))));
 *
 * console.log(bgBrightBlue(bold(red("Hello Mom!"))));
 * ```
 *
 *
 */

const ticolor = new Ticolor();

// v0.0.1

// colors 10
/** **Color Black** */
export const black = ticolor.black;
/** **Color Blue** */
export const blue = ticolor.blue;
/** **Color Cyan** */
export const cyan = ticolor.cyan;
/** **Color Gray** */
export const gray = ticolor.gray;
/** **Color Green** */
export const green = ticolor.green;
/** **Color Grey  */
export const grey = ticolor.grey;
/** **Color White** */
export const white = ticolor.white;
/** **Color Yellow** */
export const yellow = ticolor.yellow;
/** **Color Magenta** */
export const magenta = ticolor.magenta;
/** **Color Red** */
export const red = ticolor.red;

// color bright 7
/** **Color Bright Blue** */
export const brightBlue = ticolor.brightBlue;
/** **Color Bright Cyan** */
export const brightCyan = ticolor.brightCyan;
/** **Color Bright Green** */
export const brightGreen = ticolor.brightGreen;
/** **Color Bright Magenta** */
export const brightMagenta = ticolor.brightMagenta;
/** **Color Bright Red** */
export const brightRed = ticolor.brightRed;
/** **Color Bright White** */
export const brightWhite = ticolor.brightWhite;
/** **Color Bright Yellow** */
export const brightYellow = ticolor.brightYellow;

// bg colors 7
/** **Background Black** */
export const bgBlack = ticolor.bgBlack;
/** **Background Blue** */
export const bgBlue = ticolor.bgBlue;
/** **Background Cyan** */
export const bgCyan = ticolor.bgCyan;
/** **Background Green** */
export const bgGreen = ticolor.bgGreen;
/** **Background Magenta** */
export const bgMagenta = ticolor.bgMagenta;
/** **Background Red** */
export const bgRed = ticolor.bgRed;
/** **Background White** */
export const bgWhite = ticolor.bgWhite;

// bg bright 7
/** **Background Bright Blue** */
export const bgBrightBlue = ticolor.bgBrightBlue;
/** **Background Bright Cyan** */
export const bgBrightCyan = ticolor.bgBrightCyan;
/** **Background Bright Green** */
export const bgBrightGreen = ticolor.bgBrightGreen;
/** **Background Bright Magenta** */
export const bgBrightMagenta = ticolor.bgBrightMagenta;
/** **Background Bright Red** */
export const bgBrightRed = ticolor.bgBrightRed;
/** **Background Bright White** */
export const bgBrightWhite = ticolor.bgBrightWhite;
/** **Background Bright Yellow** */
export const bgBrightYellow = ticolor.bgBrightYellow;

// text styles
/** **text style dim** */
export const dim = ticolor.dim;
/** **text style bold** */
export const bold = ticolor.bold;
/** **text style hidden** */
export const hidden = ticolor.hidden;
/** **text style inverse** */
export const inverse = ticolor.inverse;
/** **text style italic** */
export const italic = ticolor.italic;
/** **text style strikethrough** */
export const strikethrough = ticolor.strikethrough;
/** **text style underline** */
export const underline = ticolor.underline;

/** Reset All Styled */
export const reset = ticolor.reset;

export interface StyleToDevServer {
  port?: number;
  siteName?: string;
  hostName?: string;
}
/** Styled to dev server running */
export function styleToDevServer({
  port,
  siteName,
  hostName,
}: StyleToDevServer): string {
  const p = port ?? 5454;
  const sn = siteName ?? "SWAN";
  const hn = hostName ?? "localhost";
  return boxen(
    green(` 🚀 Dev server is running at  : ${magenta(`http://${hn}:${p}`)}`),
    { padding: 1, title: `${sn}`, textAlignment: "center" }
  );
}

export function warn2terminal(text: string): string {
  return boxen(brightYellow(text), {
    padding: 1,
    textAlignment: "center",
    title: "⚠️",
    titleAlignment: "center",
  });
}

export function success2terminal(text: string): string {
  return boxen(brightGreen(text), {
    padding: 1,
    textAlignment: "center",
    title: "✅ ",
    titleAlignment: "center",
  });
}

export { boxen };
export type { Options };
export default ticolor;

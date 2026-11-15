// The pictures: one tile per square and a caption under the board. They are
// SVG served with no caching, so the README shows the game as it is right now.

import { EMPTY, isOver, winLine } from "./logic.js";

const INK = "#0d1020";
const PAPER = "#fff5dc";
const AMBER = "#ffb200";
const RED = "#ff5340";
const BLUE = "#2f6fed";
const NAMES = ["the top left corner", "the top edge", "the top right corner", "the left edge", "the centre", "the right edge", "the bottom left corner", "the bottom edge", "the bottom right corner"];

const cross = `<path d="M30 30 62 62M62 30 30 62" fill="none" stroke-linecap="round"`;
const MARKS = {
  x: `${cross} stroke="${INK}" stroke-width="19"/>${cross} stroke="${RED}" stroke-width="10"/>`,
  o: `<circle cx="46" cy="46" r="18" fill="none" stroke="${INK}" stroke-width="18"/><circle cx="46" cy="46" r="18" fill="none" stroke="${BLUE}" stroke-width="9.5"/>`,
  _: "",
};

/** The picture of square i. */
export function tile(game, i) {
  const cell = game.board[i];
  const line = winLine(game.board);
  const over = isOver(game.board);
  const faded = over && cell === "_";
  const fill = line?.includes(i) ? AMBER : cell === "o" && i === game.last && !over ? "#ffe7a3" : PAPER;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
<g${faded ? ' opacity="0.42"' : ""}>
${faded ? "" : `<rect x="11" y="11" width="84" height="84" rx="17" fill="${AMBER}"/>`}
<rect x="4" y="4" width="84" height="84" rx="17" fill="${fill}" stroke="${INK}" stroke-width="4"/>
${MARKS[cell]}
</g>
</svg>`;
}

/** What to say about the game, and the running score. */
export function captionText(game) {
  let headline;
  const line = winLine(game.board);
  if (line && game.board[line[0]] === "x") headline = "Three in a row. You win!";
  else if (line) headline = "Three in a row. I win.";
  else if (isOver(game.board)) headline = "A draw.";
  else if (game.board === EMPTY) headline = "Your move. You play X.";
  else headline = `I took ${NAMES[game.last]}. Your move.`;

  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  const score = game.played
    ? `${plural(game.played, "game", "games")} so far: I won ${game.won}, ${plural(game.drawn, "draw", "draws")}, you won ${game.lost ?? 0}`
    : "No games yet. Be the first to try.";
  return { headline, score };
}

// ── the buttons next to the caption ────────────────────────────────────────
// They are pictures too, so they can come and go with the game: a README
// cannot hide a link, but a picture can be one transparent pixel.

const NOTHING = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1" width="1" height="1"/>`;
const BUTTONS = {
  // label, width of the label in Helvetica bold 15, icon (drawn in a 24 x 24 box)
  new: ["New game", 67, `<path d="M19.5 12a7.5 7.5 0 1 1-2.3-5.4M17.5 3v4h-4" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`],
  first: ["Let me start", 88, `<path d="M8 5.5v13l10.5-6.5z" fill="${INK}" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>`],
};

/** Is this button on offer right now? A new game once this one is over; "let me start" also on a clean board. */
export const offers = (kind, game) => isOver(game.board) || (kind === "first" && game.board === EMPTY);

/** A button as tall as the caption, so the two sit on one line. One transparent pixel when it is not on offer. */
export function button(kind, game) {
  if (!BUTTONS[kind] || !offers(kind, game)) return NOTHING;
  const [label, labelWidth, icon] = BUTTONS[kind];
  const body = 15 + 19 + 8 + labelWidth + 17;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${body + 9} 66" width="${body + 9}" height="66" role="img" aria-label="${label}">
<rect x="6" y="16" width="${body}" height="38" rx="19" fill="${AMBER}"/>
<rect x="2" y="12" width="${body}" height="38" rx="19" fill="${PAPER}" stroke="${INK}" stroke-width="3"/>
<g transform="translate(16 21.5) scale(0.79)">${icon}</g>
<text x="${2 + 15 + 19 + 8}" y="36.2" fill="${INK}" font-family="Helvetica, Arial, sans-serif" font-size="15" font-weight="700" textLength="${labelWidth}" lengthAdjust="spacingAndGlyphs">${label}</text>
</svg>`;
}

const escape = (text) => String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** The line under the board. `signature` (a name, a site) is written in the corner: the board says whose it is. */
export function caption(game, signature = "") {
  const { headline, score } = captionText(game);
  const font = `font-family="Helvetica, Arial, sans-serif"`;
  const signed = signature ? `\n<text x="498" y="51" fill="${INK}" ${font} text-anchor="end" font-size="10" font-weight="700" opacity="0.55">${escape(signature)}</text>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 66" width="520" height="66" role="img" aria-label="${headline} ${score}">
<rect x="7" y="7" width="509" height="55" rx="15" fill="${AMBER}"/>
<rect x="2" y="2" width="509" height="55" rx="15" fill="${PAPER}" stroke="${INK}" stroke-width="3"/>
<text x="256" y="25" fill="${INK}" ${font} text-anchor="middle" font-size="16" font-weight="700">${headline}</text>
<text x="256" y="43" fill="${INK}" ${font} text-anchor="middle" font-size="12" opacity="0.75">${score}</text>${signed}
</svg>`;
}

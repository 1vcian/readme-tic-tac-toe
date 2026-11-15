// Prints the HTML to paste into a profile README: `node snippet.mjs https://your-worker.workers.dev`
// An optional second argument is a link added to the small print (where to get the source, for instance).

const [worker, source] = process.argv.slice(2);
if (!worker) {
  console.error("usage: node snippet.mjs <worker url> [source url]");
  process.exit(1);
}
const W = worker.replace(/\/$/, "");
const TILE = 72;
const SPOTS = ["top left", "top", "top right", "left", "centre", "right", "bottom left", "bottom", "bottom right"];
const square = (i) => `<a href="${W}/play/${i}" title="Play ${SPOTS[i]}"><img src="${W}/cell/${i}.svg" width="${TILE}" height="${TILE}" alt="${SPOTS[i]} square"></a>`;
const rows = [0, 3, 6].map((start) => [0, 1, 2].map((offset) => square(start + offset)).join(" "));

// The landing mark: a blank character (U+2800) the browser can scroll to. Browsers highlight such a
// target, so it is shrunk to a fraction of a pixel and placed against the full stop of the small print,
// where the one bright pixel that is left cannot be told from the text. GitHub keeps each tag nested
// twice at most, so the shrinking takes a mix: sub and sup are 75% each, rt is 50%, samp and tt 85%.
const SHRINK = ["sub", "sup", "sub", "sup", "ruby", "rt", "ruby", "rt", "samp", "samp", "tt", "tt"];
const mark = `${SHRINK.map((tag) => `<${tag}>`).join("")}&#10240;${[...SHRINK].reverse().map((tag) => `</${tag}>`).join("")}`;

const more = source ? ` &nbsp;·&nbsp; <a href="${source}">Put one on your profile</a>` : "";

// One paragraph, on purpose: the board, a line of small print, the caption. After a move the Worker sends
// visitors back to the blank character at the end of the small print, in the middle of the block. It is kept
// short because pictures higher up the README that load late push it down, and it has to stay on screen.
console.log(`<div align="center">

<!-- Tic-tac-toe served by a Cloudflare Worker: each square is a live picture, each click a move. -->
<p>
${rows.join("<br>\n")}<br>
<sub>You play X. There is one board, and everyone visiting plays on it.${mark}${more}</sub><br>
<a href="${W}/" title="Refresh the board"><img src="${W}/caption.svg" width="520" alt="The state of the game and the score so far"></a> <a href="${W}/new" title="New game"><img src="${W}/button/new.svg" alt="New game"></a> <a href="${W}/new?first=me" title="New game, and I start"><img src="${W}/button/first.svg" alt="Let me start"></a>
</p>

</div>`);

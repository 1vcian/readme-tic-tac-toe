// Prints the HTML to paste into a profile README: `node snippet.mjs https://your-worker.workers.dev`
// An optional second argument is a link shown next to "New game" (where to get the source, for instance).

const [worker, source] = process.argv.slice(2);
if (!worker) {
  console.error("usage: node snippet.mjs <worker url> [source url]");
  process.exit(1);
}
const W = worker.replace(/\/$/, "");
const SPOTS = ["top left", "top", "top right", "left", "centre", "right", "bottom left", "bottom", "bottom right"];
const square = (i) => `<a href="${W}/play/${i}" title="Play ${SPOTS[i]}"><img src="${W}/cell/${i}.svg" width="88" height="88" alt="${SPOTS[i]} square"></a>`;
const rows = [0, 3, 6].map((start) => [0, 1, 2].map((offset) => square(start + offset)).join(" "));
// The landing mark: a blank character (U+2800) the browser can scroll to, shrunk until it is about a pixel
// wide. GitHub keeps each tag nested twice at most, so it takes a mix: sub and sup are 75% each, rt is 50%.
const mark = "<sub><sup><sub><sup><ruby><rt><ruby><rt>&#10240;</rt></ruby></rt></ruby></sup></sub></sup></sub>";
const links = [`<a href="${W}/new">New game</a>`, `<a href="${W}/new?first=me">Let me start</a>`, source && `<a href="${source}">Put one on your profile</a>`].filter(Boolean);

console.log(`<div align="center">

<!-- Tic-tac-toe served by a Cloudflare Worker: each square is a live picture, each click a move. -->
<p>
${rows.join("<br>\n")}
</p>

<!-- Keep this line right under the board: after a move the Worker sends visitors back to the blank character in it. -->
<p>${mark} <sub>You play X. There is one board, and everyone visiting plays on it.</sub></p>

<p><a href="${W}/" title="Refresh the board"><img src="${W}/caption.svg" width="520" alt="The state of the game and the score so far"></a></p>

<p>${links.join(" &nbsp;·&nbsp; ")}</p>

</div>`);

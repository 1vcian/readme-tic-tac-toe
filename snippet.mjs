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

const more = source ? ` &nbsp;·&nbsp; <a href="${source}">Put one on your profile</a>` : "";

// The anchor is where visitors land after a move: the Worker sends them back to it. Keep it above the
// heading that introduces the game, so that the board ends up near the top of the window, clear of the
// bar GitHub keeps there. The block is one short paragraph on purpose: pictures higher up the README
// that load late push it down, and it has to stay on screen all the same.
console.log(`<a name="tic-tac-toe"></a>

<div align="center">

<!-- Tic-tac-toe served by a Cloudflare Worker: each square is a live picture, each click a move. -->
<p>
${rows.join("<br>\n")}<br>
<sub>You play X. There is one board, and everyone visiting plays on it.${more}</sub><br>
<a href="${W}/new" title="New game"><img src="${W}/button/new.svg" alt="New game"></a> <a href="${W}/tap"><img src="${W}/caption.svg" width="520" alt="The state of the game and the score so far"></a> <a href="${W}/new?first=me" title="New game, and I start"><img src="${W}/button/first.svg" alt="Let me start"></a>
</p>

</div>`);

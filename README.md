# Tic-tac-toe for a GitHub profile

The game on [my profile](https://github.com/1vcian), and everything you need to put one on yours.

A README cannot run code, but it can show pictures and follow links. So every square is a picture drawn by a small Cloudflare Worker, wrapped in a link to that same Worker: the link plays your move, the Worker answers, and you are sent straight back to the profile, where the pictures now show the new board.

- **One board for everyone.** The game lives in a Durable Object, and whoever visits plays on it. A game left alone for ten minutes starts over.
- **You can win.** About one move in four the Worker plays any free square instead of the best one. It still takes a win and blocks a threat that is one move away, so beating it takes two threats at once. Someone who makes no mistakes wins about a third of the games.
- **It lands on the board.** After a move the Worker sends you back to an anchor placed just above the game. GitHub renames README anchors to `user-content-...` and, on a profile page, does not map the short name back, so the link uses the full name and the browser finds it by itself. The block is kept short on purpose: images higher up the README that load late push it down, and it has to stay on screen either way.
- **Buttons that come and go.** "New game" and "Let me start" are pictures as well, so they are drawn only when they are on offer.
- **No tracking, no accounts.** The only thing stored is the board and the score.

## Put one on your profile

Please run your own instead of pointing your README at mine: mine sends every click back to my profile and signs the board with my name.

1. Fork this repository, or clone it. You need a Cloudflare account; the free plan is enough.
2. In [`wrangler.jsonc`](wrangler.jsonc), set `name` (it becomes part of the address), `PROFILE` (your profile's address) and `SIGNATURE` (what the board is signed with, or nothing).
3. Deploy it: `npx wrangler deploy`. It prints the address of your Worker.
4. Get the HTML for your README: `node snippet.mjs https://your-worker.your-name.workers.dev`. Add a second address if you want a link next to "New game", to this repository for instance.
5. Paste it into the README of your profile repository. Its first line is the anchor visitors land on: move it above the heading of that section.

`npm test` checks the rules, and `npx wrangler dev` runs the Worker on your machine.

## What it costs

Each view of the profile asks the Worker for ten pictures, and each move is one more request. The free plan allows 100,000 requests a day, which is thousands of visits.

## The files

| file | what it does |
| --- | --- |
| [`src/logic.js`](src/logic.js) | the rules and the opponent, as plain functions |
| [`src/draw.js`](src/draw.js) | the pictures: the tiles, the caption and the buttons |
| [`src/worker.js`](src/worker.js) | the addresses, and the Durable Object that keeps the game |
| [`snippet.mjs`](snippet.mjs) | prints the HTML for a README |
| [`test/`](test) | `node --test` |

## License

[MIT](LICENSE) © [Lucian Medrihan](https://1vcian.me)

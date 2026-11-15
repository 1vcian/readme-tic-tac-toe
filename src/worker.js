// A tic-tac-toe for a GitHub profile README (this one: https://github.com/1vcian).
//
// A README cannot run code, but it can show pictures and follow links. So
// each square is a picture served from here, wrapped in a link to here: the
// link plays the move and sends you straight back to the profile, where the
// pictures now show the new board.
//
//   GET /cell/4.svg    the picture of square 4, as it is now
//   GET /caption.svg   the line under the board
//   GET /button/new.svg, /button/first.svg
//                      "New game" and "Let me start": drawn when they are on
//                      offer, one transparent pixel when they are not
//   GET /play/4        you take square 4, I answer, back to the profile
//   GET /new           a clean board, if the game is over (/new?first=me and I open)
//   GET /tap           what the caption links to: a new game once this one is
//                      over, otherwise it only brings you back to the board
//   GET /state         the game as JSON
//
// There is one board, and everyone who visits plays on it.
// Whose profile it is, and the name signed under the board, are set in wrangler.jsonc.

import { DurableObject } from "cloudflare:workers";
import { button, caption, tile } from "./draw.js";
import { current, fresh, play, restart } from "./logic.js";

// Back to the profile, scrolled to the game. The README has an anchor,
// <a name="tic-tac-toe">, just above it. GitHub renames anchors in a README
// to "user-content-...", and on a profile page it does not map the short name
// back, so the link has to use the full one: then the browser itself finds it.
const homeOf = (env) => `${env.PROFILE}#user-content-tic-tac-toe`;

// The pictures and the redirects must never be cached: they are the game as it is now.
const FRESH = { "Cache-Control": "no-cache, no-store, max-age=0, must-revalidate" };

/** Holds the one game. A Durable Object, so two clicks can never trample each other. */
export class Game extends DurableObject {
  async #read() {
    return current((await this.ctx.storage.get("game")) ?? fresh(), Date.now());
  }

  async view() {
    return this.#read();
  }

  async move(i) {
    const next = play(await this.#read(), i, Date.now());
    await this.ctx.storage.put("game", next);
    return next;
  }

  async reset(iStart) {
    const next = restart(await this.#read(), Date.now(), iStart);
    await this.ctx.storage.put("game", next);
    return next;
  }
}

/**
 * Only a person following a link moves a piece: not a crawler, not a link
 * preview, not a script. Browsers say so themselves when a page is being
 * opened (Sec-Fetch-Dest: document); anything that does not is ignored.
 */
function isVisitor(request) {
  return request.method === "GET" && request.headers.get("Sec-Fetch-Dest") === "document";
}

const svg = (body) => new Response(body, { headers: { "Content-Type": "image/svg+xml; charset=utf-8", ...FRESH } });
const backTo = (url) => new Response(null, { status: 302, headers: { Location: url, ...FRESH } });

export default {
  async fetch(request, env) {
    if (request.method !== "GET" && request.method !== "HEAD") return new Response("Method not allowed", { status: 405 });
    const url = new URL(request.url);
    const game = env.GAME.get(env.GAME.idFromName("the-board"));
    const home = () => backTo(homeOf(env));

    const cell = url.pathname.match(/^\/cell\/([0-8])\.svg$/);
    if (cell) return svg(tile(await game.view(), Number(cell[1])));
    if (url.pathname === "/caption.svg") return svg(caption(await game.view(), env.SIGNATURE));
    const control = url.pathname.match(/^\/button\/(new|first)\.svg$/);
    if (control) return svg(button(control[1], await game.view()));

    const move = url.pathname.match(/^\/play\/([0-8])$/);
    if (move) {
      if (isVisitor(request)) await game.move(Number(move[1]));
      return home();
    }
    // A game that is being played is never wiped: if two people ask for a new
    // game at once, the second finds it already started and is simply taken
    // back to it. The Durable Object handles one request at a time, so the
    // two can never both restart it.
    if (url.pathname === "/new" || url.pathname === "/tap") {
      if (isVisitor(request)) await game.reset(url.pathname === "/new" && url.searchParams.get("first") === "me");
      return home();
    }
    if (url.pathname === "/state") return Response.json(await game.view(), { headers: FRESH });

    return home();
  },
};

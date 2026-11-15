// A tic-tac-toe for a GitHub profile README (this one: https://github.com/1vcian).
//
// A README cannot run code, but it can show pictures and follow links. So
// each square is a picture served from here, wrapped in a link to here: the
// link plays the move and sends you straight back to the profile, where the
// pictures now show the new board.
//
//   GET /cell/4.svg    the picture of square 4, as it is now
//   GET /caption.svg   the line under the board
//   GET /play/4        you take square 4, I answer, back to the profile
//   GET /new           a clean board            (/new?first=me and I open)
//   GET /state         the game as JSON
//
// There is one board, and everyone who visits plays on it.
// Whose profile it is, and the name signed under the board, are set in wrangler.jsonc.

import { DurableObject } from "cloudflare:workers";
import { caption, tile } from "./draw.js";
import { current, fresh, play, restart } from "./logic.js";

// Back to the profile, scrolled to the board. Anchors do not work on a profile
// page, so this is a text fragment: the browser scrolls to a piece of text.
// The README keeps a blank character (U+2800) under the board, shrunk to a
// pixel, so the board lands in view and nothing shows as highlighted.
const homeOf = (env) => `${env.PROFILE}#:~:text=%E2%A0%80`;
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

/** Only a person following a link moves a piece: not a crawler, not a link preview. */
function isVisitor(request) {
  if (request.method !== "GET") return false;
  const destination = request.headers.get("Sec-Fetch-Dest");
  if (destination) return destination === "document";
  return !/bot|crawl|spider|slurp|preview|fetch|curl|wget|monitor|camo|python|http/i.test(request.headers.get("User-Agent") ?? "");
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

    const move = url.pathname.match(/^\/play\/([0-8])$/);
    if (move) {
      if (isVisitor(request)) await game.move(Number(move[1]));
      return home();
    }
    if (url.pathname === "/new") {
      if (isVisitor(request)) await game.reset(url.searchParams.get("first") === "me");
      return home();
    }
    if (url.pathname === "/state") return Response.json(await game.view(), { headers: FRESH });

    return home();
  },
};

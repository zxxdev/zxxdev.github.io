---
title: TrailMate
repo: zxxdev/TrailMate
summary: "A leveling coach addon for World of Warcraft: Forever, with quest guides, its own arrow and map marks, talents and dungeons."
tone: amber
status:
  kind: early
  # As declared in the addon's TrailMate.toc ("## Version: 0.1.0-alpha").
  version: 0.1.0-alpha
stack: [Lua, Go, luacheck, busted]
tooling: [GitHub Actions]
cover:
  # Cropped from an in-game screenshot at its real size, with no character, guild or realm names.
  kind: screenshot
  image: ../../assets/projects/trailmate.png
  alt: "TrailMate's step window in the game: 33-34 Stranglethorn Vale, step 22 of 92, do Bloody Bone Necklaces, with the next steps, Done and Skip buttons, and a bar below saying the bags are full, with a Take me button."
featured: true
order: 2
---

## The problem

Leveling a character means deciding, over and over, which quests to take, where to go next, what
to learn at the class trainer and what to sell. Without help, that means stopping the game to look
things up. TrailMate gives that advice inside the game and explains each recommendation.

## How it works

- **It advises, it never plays.** It reads what the game shows and draws text, an arrow and marks
  on the map. It never presses keys, moves the character, buys, sells or trains.
- **Quest guides** for both factions from level 1 to 60, and a route built from the quest log when
  there is no guide.
- **Its own arrow and map marks.** It needs no other addon.
- **Advice at the trainer and the vendor:** what to learn, skip or leave for later, and what to
  sell, keep or take to the auction house, each with its reason.
- **An optional AI companion.** An addon cannot reach the internet, so a small Go program on the
  player's PC carries the messages through files the game already writes. The companion only
  answers questions: it has no tools.

The addon is written in Lua and checked with luacheck and busted. The bridge is written in Go and
checked with `go vet` and its tests. Both run in CI on every pull request.

## Decisions

- [The companion bridge](https://github.com/zxxdev/TrailMate/blob/main/docs/adr/0001-companion-bridge.md):
  how messages leave the game without a network connection, and why. The idea comes from
  [Witchcraft](https://github.com/Geraldlol/witchcraft).

## Status

Alpha. It is played and tested on one character, so expect rough edges. The known issues are listed
in the [repository](https://github.com/zxxdev/TrailMate#known-issues).

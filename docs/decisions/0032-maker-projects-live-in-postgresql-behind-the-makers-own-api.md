---
num: 32
title: Maker projects live in PostgreSQL, behind the Maker's own API
short: "Maker projects"
summary: >-
  The Maker keeps its projects in PostgreSQL: one row per project, the whole site as jsonb, and a
  revision every save must name. Everything that reads or changes a project (the Maker app, an agent
  through the MCP) goes through one HTTP API, so there is one owner of persistence and one place where
  a site is checked before it is stored.
---

A Maker site was first kept in the browser, then in a file an agent could also write. Neither holds
several projects, survives a cleared browser, or lets two windows edit the same project safely. The
Maker now keeps projects in PostgreSQL (`@skryensya/maker-server`).

## One row, the whole site

A project is a row: name, the site as `jsonb`, and a revision. The site is one document because it
is only ever read and written whole (the Maker opens a project, the MCP reads one to apply
operations); splitting pages or nodes into tables would add joins for no query anyone makes. The
server stores a site only if it reads as a Maker site, so the database never holds something the
Maker cannot open.

## A save names its revision

`PUT` carries the revision the change was made on. On any other, nothing is written and the current
project comes back (409). The Maker then shows that version, with the person's own one step back in
undo; an agent gets the current outline and re-reads. Nobody's work is overwritten by a race, and no
lock is held while a person thinks.

## One API, and LISTEN/NOTIFY

The MCP's maker tools call the Maker's API instead of the database. Connecting the MCP to Postgres
directly would have given it a second copy of the save rules. A trigger announces every change on a
channel, so a save from any process reaches every open Maker through its event stream.

## Consequences

- The Maker needs a running database for projects. Without one it still works, with a single site in
  the browser, and says so.
- The API is mounted in the Maker's dev server. A production deployment needs a server process for
  the same handler; the handler is written for plain `node:http` so that is a mount, not a rewrite.

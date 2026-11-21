# Changelog

Release Please records new releases here. Earlier releases retain their original written notes:

## Unreleased

### Fixes

- **Megamenu: the panel's position can be configured.** Four optional attributes on `[data-sk-megamenu]`, read at mount and kept through resize, scroll, switching menus and teardown: `data-anchor="<selector>"` (an ancestor first, else the document; no match falls back to the root and warns in dev), `data-placement` (`block-end`, the default; `block-end-start`; `block-end-end`), `data-offset="<px>"` and `data-match-width`. Without them the panel is placed exactly as before. Vanilla and React.
- **Tooltip: it opens next to its trigger after a scroll.** The popper placed it in document coordinates while `.sk-anchored` is `position: fixed`, so it landed one scroll offset away (about 650px after scrolling 700px). Tooltip and Segmented's tips now use `strategy: "fixed"` all the way through. The other anchored boxes already write their `position` inline, matching their coordinates.
- **Marquee: the speed is right with the shipped tokens.** The minified CSS publishes the cadence in seconds (`.96s`) and the bindings read it as milliseconds, so the strip ran about 1000× too fast. Both units are parsed now.

Consumers can remove their workarounds: the `!important` position/transform override on `.sk-megamenu__positioner` (use `data-anchor`, `data-match-width` and `data-offset` instead), the `.sk-anchored { position: absolute }` override for tooltips, and any hand-set marquee cadence or duration.

- [v0.0.3](docs/releases/v0.0.3.md) ([Spanish](docs/releases/v0.0.3.es.md))
- [v0.0.2](docs/releases/v0.0.2.md) ([Spanish](docs/releases/v0.0.2.es.md))
- [v0.0.1](docs/releases/v0.0.1.md) ([Spanish](docs/releases/v0.0.1.es.md))

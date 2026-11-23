# Changelog

## [0.0.4](https://github.com/Skryensya/ui/compare/v0.0.3...v0.0.4) (2026-11-23)


### Features

* **carousel:** curve="convex|concave" stands the slides on a ring; defaultPage opens mid-way ([bd20f4d](https://github.com/Skryensya/ui/commit/bd20f4d38af151a917da7c1a8568c20632fe930a))
* **carousel:** CurveCarousel is a wheel: infinite roll, momentum, stepper, autoplay, own page ([7f236e9](https://github.com/Skryensya/ui/commit/7f236e9c496fd70ece1b8200c6edb37d89c63d16))
* **carousel:** CurveCarousel tall and focus, real bend, keyboard, no flat first frame ([5a24e4f](https://github.com/Skryensya/ui/commit/5a24e4f9f5702032b6eb5ef03f6e1b6824061e63))
* **carousel:** StripCarousel, one item open and the rest as strips that thin out ([77db5aa](https://github.com/Skryensya/ui/commit/77db5aaa06fc711988d40dcbe917448a1821b816))
* **cli:** add --icons installs the set and writes it; add prints the setup that works ([d9df561](https://github.com/Skryensya/ui/commit/d9df56180cdd02e000438482ec7291acfc0464d6))
* core presets, joined SearchField form, plain single-version label, wider List icon gap ([bdb0a59](https://github.com/Skryensya/ui/commit/bdb0a59b942c3fc7024d3272327bed26fe465d97))
* **core:** dispatch sk-canvas-view with the target view on every change ([a79e027](https://github.com/Skryensya/ui/commit/a79e027396c8d3010f652950184978f103fe3d7c))
* **docs:** add a Button variants canvas to replace break harnesses ([e2f9223](https://github.com/Skryensya/ui/commit/e2f9223621b1825e439d3529edda4648f64d91c0))
* **docs:** add an all-components canvas page ([0078509](https://github.com/Skryensya/ui/commit/0078509fdc7df134f5f2fb4d1765507f39e9287e))
* **docs:** drop dead header links in production, add canvas prev/next and loader ([ce142fa](https://github.com/Skryensya/ui/commit/ce142fa85ed56e9985afa9255c66ebdb278f532d))
* **docs:** group the canvas into one cluster per sidebar category ([04c79d9](https://github.com/Skryensya/ui/commit/04c79d9bcb0288a0a1f4bcf2b999feb4337abaa5))
* **docs:** grow canvas names smoothly and blur blocks behind them when far ([28a1ad5](https://github.com/Skryensya/ui/commit/28a1ad527dee369ddafc5d61462fd8192b165b9f))
* **docs:** label canvas blocks at a steady size and preload further ([e80c41a](https://github.com/Skryensya/ui/commit/e80c41a15027ef2f5d5da2f571ed9b133869c683))
* **docs:** let the components canvas zoom out to 12.5% ([a37411e](https://github.com/Skryensya/ui/commit/a37411eb32e89d3812d4a8a0b54378010e78babb))
* **docs:** one canvas page per component, beside the docs rail ([0ca3161](https://github.com/Skryensya/ui/commit/0ca31615c8719fae9d1804d88456923ef1a349db))
* **icons:** icon sets from Iconify, installed by the project; drop the icons-* packages ([8dc13fd](https://github.com/Skryensya/ui/commit/8dc13fd99115e62808ff2d6181f86f0927b815e2))
* Magnifier and Gallery, frameless Accordions, 0.0.4 release notes ([4052e34](https://github.com/Skryensya/ui/commit/4052e345ebd31a2f3366b57af9979597b11627b1))
* two-month range Calendar and DatePicker, docs search and command palette polish ([a66c34c](https://github.com/Skryensya/ui/commit/a66c34ccf13ca1a1d664e4d0e86a2e9791748722))


### Bug Fixes

* **ai-compiler:** render the agent docs from the artifacts it wrote ([c178282](https://github.com/Skryensya/ui/commit/c178282342b5ce9c88a8143ef7f9485eec03e24e))
* **combobox:** default labels in English, like the rest of the kit ([73de15d](https://github.com/Skryensya/ui/commit/73de15dd5561a14023812c5d43af22e3f7b744ff))
* configurable Megamenu panel placement, fixed-strategy Tooltip, Marquee cadence in seconds ([6af4bf6](https://github.com/Skryensya/ui/commit/6af4bf6bec253b68fe952a6a9b718257afca2190))
* **docker:** let the docs image copy docs/releases past the .dockerignore ([39a9dab](https://github.com/Skryensya/ui/commit/39a9dab7cf61312a7da1ddc4e984c003e8904cd9))
* **docs:** bind the site icon set in the property playground island ([86b9fdc](https://github.com/Skryensya/ui/commit/86b9fdcde0365d27cd3d8e7622c2af94c8205b21))
* **docs:** cap canvas label growth to a smaller maximum and its block's width ([36b5bd8](https://github.com/Skryensya/ui/commit/36b5bd87851ba033b2ee1e42a2e5921ae128e6c2))
* **docs:** link the floating header Megamenu preview to its Pill story ([94f1f6f](https://github.com/Skryensya/ui/commit/94f1f6f31c37e520072a4e82baee7e05182d1241))
* **docs:** load pattern sheets in the canvas and show a few values per option ([a8e2920](https://github.com/Skryensya/ui/commit/a8e2920a5127ca9823a1b7ddb265514043e4f684))
* **docs:** make pages revalidate so a deploy shows without a hard refresh ([f2ff02a](https://github.com/Skryensya/ui/commit/f2ff02aabbe8437baeeceab2f5f8279032a2981d))
* **docs:** paint icon placeholders at build so no icon waits for script ([946bf88](https://github.com/Skryensya/ui/commit/946bf886de30a2ace9b01ba11f25d057e71f2cdd))
* **docs:** shrink Hero specimens and keep CommandPalette off the canvas ([606f0b0](https://github.com/Skryensya/ui/commit/606f0b07878fac6d706af957d70c87d4cb496bc3))
* **docs:** story generator gets its own Vite cache; a story the dev server has not re-read warns ([88f8327](https://github.com/Skryensya/ui/commit/88f8327863e50b1455393274566ab461844c4cde))
* **docs:** type the ProgressiveCarousel demo's entries as ItemInput ([ff76abf](https://github.com/Skryensya/ui/commit/ff76abf4be78405f60c9b794b8ae06b76161f677))
* **figma:** draw brand logos, read calc ratios, place Accordion variant, skip Tabs layout options ([76c1418](https://github.com/Skryensya/ui/commit/76c1418d22c42ff4ca591a1b934600f049a5eec1))
* **select:** style the native picker's scrollbar with standard properties so Vite can minify it ([617dd9b](https://github.com/Skryensya/ui/commit/617dd9b19000c8b8d57750234e31239b3333172e))
* **vanilla:** apply Zag styles from @zag-js/svelte 1.47+, runes-mode wrappers, Wada pain points ([aecdad2](https://github.com/Skryensya/ui/commit/aecdad23bf97046d0b225d39d827d66687dbaa83))
* **vanilla:** compile @zag-js/svelte into the build, so consumers need no Svelte plugin ([d29eaaf](https://github.com/Skryensya/ui/commit/d29eaafaea159a4df233701f862318e86b25fbc4))
* **vanilla:** depend on exactly the Svelte the release compiles with ([f4cd641](https://github.com/Skryensya/ui/commit/f4cd64104fcad2409985e785f43ee6717e428456))
* Wada pain points 8, 12 and 15; Vanilla Select takes data-value after mount ([00bc49a](https://github.com/Skryensya/ui/commit/00bc49aa44950bbc10f04e6014ac033784c20cbc))


### Performance Improvements

* **canvas:** one write per frame, gesture-only will-change, Safari pinch, glide, minimap ([ee7385e](https://github.com/Skryensya/ui/commit/ee7385e594ef6b63cb217e38d0a9bde4c31fc166))
* **docs:** drive canvas loading and labels from the view event ([c5f6352](https://github.com/Skryensya/ui/commit/c5f63521e45e821b5fb31d6979b52107c957bddd))
* **docs:** load only a component's own sheets on its canvas page ([d91c463](https://github.com/Skryensya/ui/commit/d91c463abb712b262a82eb342a5e7782e01c3c13))
* **docs:** mount one canvas block at a time while the view moves ([980976e](https://github.com/Skryensya/ui/commit/980976e7a65a5754010b29ec1b3867957d9cb105))
* **docs:** size canvas blocks to their content, skip loading specks ([5729331](https://github.com/Skryensya/ui/commit/5729331413571452364b49199800f80851bd8723))
* **docs:** unload far canvas blocks and cover child signatures ([b36f811](https://github.com/Skryensya/ui/commit/b36f8111d92e3cf498a782b21b32d334cb788501))

## Changelog

Release Please records new releases here. Earlier releases retain their original written notes:

- v0.0.4, unreleased: notes in progress in [docs/releases/v0.0.4.md](docs/releases/v0.0.4.md) ([Spanish](docs/releases/v0.0.4.es.md))
- [v0.0.3](docs/releases/v0.0.3.md) ([Spanish](docs/releases/v0.0.3.es.md))
- [v0.0.2](docs/releases/v0.0.2.md) ([Spanish](docs/releases/v0.0.2.es.md))
- [v0.0.1](docs/releases/v0.0.1.md) ([Spanish](docs/releases/v0.0.1.es.md))

# Choose a component

Each row is a signature's first reason to use it, from its contract. Pick the row that fits, then read the family's page: it has the rest of its useWhen, its avoidWhen and what to use instead. When nothing fits a shape, use a layout primitive (`Stack`, `Inline`, `Grid`, `Box`) with an intentional gap; never hand-roll a widget the table names.

## Actions

| The person needs | Use | Family |
|---|---|---|
| the top edge of an application (an editor, a tool, a dashboard) needs its menus in one short line of text, the way a desktop OS draws its menu bar | `AppBar` | [app-bar](components/app-bar.md) |
| it performs an action in place | `Button.action` | [button](components/button.md) |
| it takes the visitor to another page or URL and has to look like a button | `Button.navigation` | [button](components/button.md) |
| a few related actions should read as one control | `ButtonGroup` | [button-group](components/button-group.md) |
| a code block, a command or a token is going to be pasted elsewhere, and selecting it by hand is slow or imprecise | `CopyButton` | [clipboard](components/clipboard.md) |
| the value has to be seen before copying it | `Clipboard` | [clipboard](components/clipboard.md) |
| there are many destinations or actions and typing the name gets there before browsing them | `CommandPalette` | [command-palette](components/command-palette.md) |
| a set of commands acting on something, behind a trigger | `Menu` | [menu](components/menu.md) |
| a persistent bar of application commands, some with a dropdown submenu. | `Menubar` | [menubar](components/menubar.md) |
| the control needs to show one of N named states, each with its own icon, and whoever uses it will write the behaviour that decides which one is active (copying, cycling a mode, anything) | `StateButton` | [state-button](components/state-button.md) |
| there are many controls together and the keyboard should not pay one stop for each | `Toolbar` | [toolbar](components/toolbar.md) |

## Forms

| The person needs | Use | Family |
|---|---|---|
| choosing the date is the screen's task, not one more field of a form | `Calendar` | [calendar](components/calendar.md) |
| a yes-or-no decision submitted with the form | `Checkbox` | [checkbox](components/checkbox.md) |
| a set of options that can also be checked or unchecked as a whole | `CheckboxGroup` | [checkbox](components/checkbox.md) |
| the value is an arbitrary color, not one of a few fixed options | `ColorPicker` | [color-picker](components/color-picker.md) |
| the swatch lives in a toolbar or another tight place | `ColorPicker.compact` | [color-picker](components/color-picker.md) |
| only the color itself is shown, as a square preview with no value text beside it | `ColorPicker.swatch` | [color-picker](components/color-picker.md) |
| an ordinary color inside a form, with no presets or channels of its own | `ColorPicker.native` | [color-picker](components/color-picker.md) |
| the list is long | `Combobox` | [combobox](components/combobox.md) |
| the date is a field of a form, next to other fields | `DatePicker` | [date-picker](components/date-picker.md) |
| an ordinary date inside a form, with no range selection | `DatePicker.native` | [date-picker](components/date-picker.md) |
| files have to be attached | `FileUpload` | [file-upload](components/file-upload.md) |
| a control needs a label, and it almost always does | `FormField` | [form-field](components/form-field.md) |
| the platform already offers the right control (time, color, range, …) and that native behaviour is wanted with sk-input's shared appearance | `NativeInput` | [input](components/input.md) |
| whoever uses the screen has to see every option while choosing | `Listbox` | [listbox](components/listbox.md) |
| the value is a number that is typed | `NumberField` | [number-field](components/number-field.md) |
| a one-time code sent by SMS, email or an authenticator app is asked for | `OtpInput` | [otp-input](components/otp-input.md) |
| the field asks for a password, to sign in or to create a new one | `PasswordInput` | [password-input](components/password-input.md) |
| several questions are answered one at a time, with visible progress and validation before moving on | `Questionnaire` | [questionnaire](components/questionnaire.md) |
| a matrix | `Radio` | [radio-group](components/radio-group.md) |
| ONE option of a small set is chosen and all the options are worth showing | `RadioGroup` | [radio-group](components/radio-group.md) |
| the person chooses a score on a short, ordered scale | `Rating` | [rating](components/rating.md) |
| an already computed average is reported | `RatingDisplay` | [rating](components/rating.md) |
| the query filters something already on the page as it is typed | `SearchField` | [search-field](components/search-field.md) |
| the query goes to a results page | `SearchField.form` | [search-field](components/search-field.md) |
| two or three exclusive options that are best seen all at once | `Segmented` | [segmented](components/segmented.md) |
| a standard choice from a known list, inside a form | `Select.native` | [select](components/select.md) |
| the options need markup, not only text | `Select` | [select](components/select.md) |
| the value is approximate and seeing it move helps | `Slider` | [slider](components/slider.md) |
| the user narrows a range between a minimum and a maximum. | `SliderRange` | [slider](components/slider.md) |
| the change takes effect immediately | `Switch` | [switch](components/switch.md) |
| several values are typed into one field | `TagsInput` | [tags-input](components/tags-input.md) |
| a time has to be typed and the format matters | `TimeField` | [time-field](components/time-field.md) |
| picking people | `UserSelect` | [user-select](components/user-select.md) |

## Navigation

| The person needs | Use | Family |
|---|---|---|
| the page is long and someone who scrolled far wants to get back to the top without dragging the scroll by hand | `BackToTop` | [back-to-top](components/back-to-top.md) |
| the page lives inside a hierarchy and the user needs to go back up it | `Breadcrumb` | [breadcrumb](components/breadcrumb.md) |
| site/marketing navigation with categories that drop down a multi-column panel of links, edge to edge under the bar | `Megamenu` | [megamenu](components/megamenu.md) |
| the list of destinations of a sidebar, a navbar or a drawer | `NavList` | [nav-list](components/nav-list.md) |
| the app needs a top bar with a brand and actions | `Navbar` | [navbar](components/navbar.md) |
| the results come in pages and it must be possible to jump to a particular one | `Pagination` | [pagination](components/pagination.md) |
| an application's main navigation lives on the side and stays for the whole session | `Sidebar` | [sidebar](components/sidebar.md) |
| the page starts with chrome repeated on every page | `SkipLink` | [skip-link](components/skip-link.md) |
| which stage of a multi-stage process the user is at has to be shown | `Steps` | [steps](components/steps.md) |
| several sections share one region and only one is seen at a time | `Tabs` | [tabs](components/tabs.md) |
| a long document has several sections (h2/h3) and the reader needs to jump between them | `Toc` | [toc](components/toc.md) |
| the data truly nests and the hierarchy is part of what has to be understood | `TreeView` | [tree-view](components/tree-view.md) |

## Overlays

| The person needs | Use | Family |
|---|---|---|
| something has to be decided before going on | `Dialog` | [dialog](components/dialog.md) |
| a short blocking task has ordered steps and needs backward navigation | `DialogStack` | [dialog-stack](components/dialog-stack.md) |
| a button opens the stack from the page | `DialogStackTrigger` | [dialog-stack](components/dialog-stack.md) |
| the compound composition needs an explicit backdrop marker | `DialogStackOverlay` | [dialog-stack](components/dialog-stack.md) |
| a step groups its title and optional description | `DialogStackHeader` | [dialog-stack](components/dialog-stack.md) |
| a heading names the active step and its dialog | `DialogStackTitle` | [dialog-stack](components/dialog-stack.md) |
| a short sentence explains what the step asks for | `DialogStackDescription` | [dialog-stack](components/dialog-stack.md) |
| navigation and completion controls need an action row | `DialogStackFooter` | [dialog-stack](components/dialog-stack.md) |
| a control advances to the next step | `DialogStackNext` | [dialog-stack](components/dialog-stack.md) |
| a control returns to the previous step while keeping its authored content mounted | `DialogStackPrevious` | [dialog-stack](components/dialog-stack.md) |
| a visible action cancels or completes the flow and closes the dialog | `DialogStackClose` | [dialog-stack](components/dialog-stack.md) |
| photos are shown as thumbnails and the reader needs to see them large, one at a time, without leaving the page | `Lightbox` | [lightbox](components/lightbox.md) |
| a thumbnail on the page has to open its image in a Lightbox | `Lightbox.Trigger` | [lightbox](components/lightbox.md) |
| a panel with content of its own hanging from a control is needed | `Popover` | [popover](components/popover.md) |
| a floating surface and nothing more is needed | `Popover.bare` | [popover](components/popover.md) |
| a control already has an accessible name and needs a short description on hover or focus | `Tooltip` | [tooltip](components/tooltip.md) |
| a new or redesigned interface has a few pieces worth pointing out in order (three to five), and its user can ask for the tour whenever they want | `Tour` | [tour](components/tour.md) |
| the tour has to be startable, and repeatable after skipping or finishing it, from a visible and stable place (help, the header) | `Tour.Trigger` | [tour](components/tour.md) |
| a modal panel arrives from an edge and can be closed by dragging it | `Vaul` | [vaul](components/vaul.md) |
| the modal panel takes its whole edge | `Vaul.drawer` | [vaul](components/vaul.md) |
| a button on the page opens a Vaul | `Vaul.Trigger` | [vaul](components/vaul.md) |
| the panel needs a button of its own to close (a Done, an X) | `Vaul.Close` | [vaul](components/vaul.md) |
| a panel has to live alongside the page | `Window` | [window](components/window.md) |

## Feedback

| The person needs | Use | Family |
|---|---|---|
| something that happened has to be told | `Callout` | [callout](components/callout.md) |
| the page is going to show toasts | `ToastRegion` | [content](components/content.md) |
| a script is going to clone the same Toast anatomy for dynamic messages | `ToastTemplate` | [content](components/content.md) |
| a list or a region has nothing to show, and why has to be said | `EmptyState` | [empty-state](components/empty-state.md) |
| there is a wait of unknown length | `Loader` | [loader](components/loader.md) |
| the wait is already visible (there are skeletons, or a bar) and it still needs announcing | `Loader.status` | [loader](components/loader.md) |
| a line of text that is about to arrive is prefigured, and its typographic role is already known | `Placeholder` | [placeholder](components/placeholder.md) |
| what is missing is prose | `Placeholder.paragraph` | [placeholder](components/placeholder.md) |
| the gap is rectangular | `Placeholder.block` | [placeholder](components/placeholder.md) |
| the gap is an avatar or a round control, and its scale can be named (sm, md, lg) so the replacement does not jump | `Placeholder.circle` | [placeholder](components/placeholder.md) |
| how much is left is known | `Progress` | [progress](components/progress.md) |

## Data

| The person needs | Use | Family |
|---|---|---|
| almost always | `ComparisonTableScroll` | [comparison-table](components/comparison-table.md) |
| two to four things are set side by side on the same few aspects | `ComparisonTable` | [comparison-table](components/comparison-table.md) |
| the details of ONE record are shown as name and value | `DescriptionList` | [description-list](components/description-list.md) |
| rows of things of the same kind | `List` | [list](components/list.md) |
| the order of the rows communicates sequence, priority or ranking | `OrderedList` | [list](components/list.md) |
| a MEASUREMENT within a known range has to be shown, with a current value | `Meter` | [meter](components/meter.md) |
| a number with its name | `Stat` | [stat](components/stat.md) |
| almost always | `TableScroll` | [table](components/table.md) |
| the data has rows and columns, and a cell means something by where they cross | `Table` | [table](components/table.md) |
| a hand-written table needs to page its rows on the client and change how many are shown | `TablePager` | [table-pager](components/table-pager.md) |
| almost always | `TreegridScroll` | [treegrid](components/treegrid.md) |
| the data has hierarchy AND columns at once. | `Treegrid` | [treegrid](components/treegrid.md) |

## Content

| The person needs | Use | Family |
|---|---|---|
| there are several long sections and which stay open is worth coordinating | `Accordion` | [accordion](components/accordion.md) |
| several sections open and close, and letting the browser handle it is enough | `DetailsGroup` | [accordion](components/accordion.md) |
| a section that expands and needs no JavaScript at all | `Details` | [accordion](components/accordion.md) |
| the pieces of something already rendered have to be pointed at and named | `Annotated` | [annotation](components/annotation.md) |
| a sound has to be played inside the page and its controls should look like the rest of the interface instead of the browser's own bar | `AudioPlayer` | [audio-player](components/audio-player.md) |
| a short sound sits inside the page and needs only to be played | `AudioPlayerMinimal` | [audio-player](components/audio-player.md) |
| there is no photo and the person's initials are needed | `Avatar.initials` | [avatar](components/avatar.md) |
| a photo identifies a person or an entity | `Avatar.image` | [avatar](components/avatar.md) |
| several identities are shown together in a compact stack | `AvatarGroup` | [avatar](components/avatar.md) |
| a count or a short status attached to something else | `Badge` | [badge](components/badge.md) |
| a compact dot communicates presence, something new, or a status next to another control | `BadgeDot` | [badge](components/badge.md) |
| a Badge or BadgeDot is anchored to the corner of a button or an avatar | `BadgeHolder` | [badge](components/badge.md) |
| a drawing is larger than the screen showing it (a diagram, an anatomy, a plan) and rescaling it beats reflowing it | `Canvas` | [canvas](components/canvas.md) |
| there are many similar items and the horizontal space fits only a few | `Carousel` | [carousel](components/carousel.md) |
| a page or section opens with a few pictures as its centrepiece, the middle one the star | `Carousel.curve` | [carousel](components/carousel.md) |
| a section shows a few stories or announcements one at a time, a big picture with its title and a link under it | `Carousel.progressive` | [carousel](components/carousel.md) |
| there is a version history of something | `Changelog` | [changelog](components/changelog.md) |
| code has to be shown and should read as code | `CodePreview` | [code-preview](components/code-preview.md) |
| the same code has a short version to understand it and a complete one to copy it | `CodePreview.density` | [code-preview](components/code-preview.md) |
| there is a conversation with nested replies and it needs a container that names it | `CommentThread` | [comment-thread](components/comment-thread.md) |
| a comment takes actions | `CommentActions` | [comment-thread](components/comment-thread.md) |
| there is a score that goes up or down, with the reader's own vote reflected | `CommentVote` | [comment-thread](components/comment-thread.md) |
| the app creates comments at runtime and needs a blueprint to clone | `CommentTemplate` | [comment-thread](components/comment-thread.md) |
| a comment or a reply has to be written, with whatever control the consumer decides | `CommentComposer` | [comment-thread](components/comment-thread.md) |
| two versions of the same thing should be judged against each other at the same place | `CompareSlider` | [compare-slider](components/compare-slider.md) |
| how several things relate has to be explained | `Diagram` | [diagram](components/diagram.md) |
| a character, assistant or mascot needs to express a visible state | `ExpressiveAvatar` | [expressive-avatar](components/expressive-avatar.md) |
| a stream of independent units of content that can load in batches. | `Feed` | [feed](components/feed.md) |
| it reinforces an action that already has text | `Icon` | [icon](components/icon.md) |
| it crops an image or a video to a fixed aspect ratio | `ImageFrame` | [image-frame](components/image-frame.md) |
| a key or a combination the user can press is shown | `Kbd` | [kbd](components/kbd.md) |
| a short, repeated band gains meaning by moving, but the motion should only start after the person asks for it | `Marquee` | [marquee](components/marquee.md) |
| the band is secondary ambience and can start on its own without hiding or replacing needed information | `Marquee.autoplay` | [marquee](components/marquee.md) |
| one turn in a conversation needs row geometry | `Message` | [message](components/message.md) |
| consecutive messages from the same sender should stack with a shared avatar column | `MessageGroup` | [message](components/message.md) |
| the row needs a speaker avatar, or an empty avatar slot to preserve grouped alignment | `MessageAvatar` | [message](components/message.md) |
| header, message surface and footer need one aligned stack inside the conversation row | `MessageContent` | [message](components/message.md) |
| sender name or compact metadata belongs above the message surface | `MessageHeader` | [message](components/message.md) |
| delivery state, time or edited state belongs below the message surface | `MessageFooter` | [message](components/message.md) |
| message-level controls such as copy, react or delete should travel with the message row | `MessageActions` | [message](components/message.md) |
| a picture has layers (an interface over its structure over its data) and a gesture should pull them apart so the reader sees how they sit | `MorphStack` | [morph-stack](components/morph-stack.md) |
| they are instructions to follow, and the content of each step is what matters | `Procedure` | [procedure](components/procedure.md) |
| the reader has to be taken from a physical surface - a table, a poster, someone else's screen - to a URL without typing it | `QRCode` | [qr-code](components/qr-code.md) |
| words that are somebody else's are shown as theirs | `Quote` | [quote](components/quote.md) |
| temporary status text should feel alive while work is happening, such as generating or reading | `Shimmer` | [shimmer](components/shimmer.md) |
| a label that classifies content | `Tag` | [tag](components/tag.md) |
| a label that navigates to a facet, a topic or a keyword | `Tag.link` | [tag](components/tag.md) |
| a choice chip the reader selects or deselects by clicking it | `Tag.toggle` | [tag](components/tag.md) |
| the whole card goes to the same place and the whole of it should be clickable | `TileLink` | [tile](components/tile.md) |
| the whole card triggers an action | `TileButton` | [tile](components/tile.md) |
| several options are chosen and each is a card with content of its own | `TileCheckbox` | [tile](components/tile.md) |
| the card turns something on or off and the effect is immediate | `TileSwitch` | [tile](components/tile.md) |
| a single option is chosen and each one needs explaining | `TileRadioGroup` | [tile](components/tile.md) |
| there is detail not everyone needs, and hiding it lowers the page's noise | `ExpandableTile` | [tile](components/tile.md) |
| events that already happened have to be shown, in the order they happened | `Timeline` | [timeline](components/timeline.md) |
| a paragraph, a sub-line, a footnote | `Text` | [typography](components/typography.md) |
| a phrase inside text has strong importance, not just a different visual weight | `Strong` | [typography](components/typography.md) |
| it shows the computed result of an input or an interaction | `Output` | [typography](components/typography.md) |
| there is a literal inside a sentence | `Code` | [typography](components/typography.md) |
| it opens a section and which document level it belongs to has to be said | `Heading` | [typography](components/typography.md) |
| a link inside a sentence, underlined and in the flow of the text | `Link` | [typography](components/typography.md) |
| a video has to be played inside the page and its controls should look like the rest of the interface (same buttons, same focus ring, same dark chrome) instead of the browser's own bar | `VideoPlayer` | [video-player](components/video-player.md) |

## Layout

| The person needs | Use | Family |
|---|---|---|
| a group needs padding, a surface or a border around it | `Box` | [box](components/box.md) |
| a clipped edge needs to show visually that the content continues, or enters and leaves the surface | `FadeEdge` | [fade-edge](components/fade-edge.md) |
| it closes the page | `Footer` | [footer](components/footer.md) |
| it opens a page or a section | `Hero` | [hero](components/hero.md) |
| things go one below another with a steady rhythm | `Stack` | [layout](components/layout.md) |
| things go side by side | `Inline` | [layout](components/layout.md) |
| equal-width columns | `Grid` | [layout](components/layout.md) |
| a page needs a reading measure and some children should be narrower, break out or bleed edge to edge | `LayoutGrid` | [layout](components/layout.md) |
| the page is an application | `AppShell` | [layout](components/layout.md) |
| the region is the page's <main> landmark | `Main` | [layout](components/layout.md) |
| content appears and disappears with a state, and its exit has to be seen instead of cut off at once | `Presence` | [presence](components/presence.md) |
| two or more regions share one box and the person decides how much room each gets | `Resizable` | [resizable](components/resizable.md) |
| one box is the point of the section and should open from a small window to fill the whole box as the page scrolls | `ScrollExpand` | [scroll-expand](components/scroll-expand.md) |
| a scrollable region needs a one-time directional invitation before the person discovers scrolling | `ScrollHint` | [scroll-hint](components/scroll-hint.md) |
| two sections tell one story as the page scrolls and the second should read as arriving on top of the first | `ScrollStack` | [scroll-stack](components/scroll-stack.md) |
| a rule divides two blocks that are about different things | `Separator` | [separator](components/separator.md) |
| there is a word between the two halves | `LabelledSeparator` | [separator](components/separator.md) |
| the page needs a centered measure so the text does not stretch edge to edge | `Wrapper` | [wrapper](components/wrapper.md) |

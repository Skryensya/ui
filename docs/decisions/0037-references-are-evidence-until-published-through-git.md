---
num: 37
title: References are evidence until published through Git
short: "Reference ingestion"
summary: >-
  Captures live in a separate PostgreSQL working store, with raw assets in object storage. Human
  review accepts a reference, not a catalogue entry. The publisher turns curated UsageTrees and
  pattern content into validated example changes on a GitHub branch and pull request; only merged
  repository content belongs to the catalogue.
---

A captured website is evidence, not an example we endorse. Putting every capture into
`contracts/examples` would confuse collecting material with making a reusable Skryensya composition,
expand Git with screenshots and DOM snapshots, and expose unreviewed material through `get_examples`.

Reference ingestion therefore owns its own PostgreSQL store, separate from Maker. Relational columns
support triage by source, status, date and taxonomy; field provenance keeps human decisions distinct
from classifier proposals. Revision checks refuse obsolete writes. Capture, bounded classification,
review and publication are separate operations with explicit lifecycle transitions. Acceptance means
that a reference is worth using, not that DOM has somehow become a UsageTree.

Screenshots and raw semantic captures live in S3/R2-compatible asset storage (filesystem for local
work). Their object keys and deterministic fingerprints live in PostgreSQL. Publication does not
remove the evidence: a published reference must remain inspectable. Large raw assets never enter Git.

Git remains authoritative for published examples. The publisher is the only subsystem that knows
how to generate `pattern`, `use` and `fixed` files, and integrates them into the existing catalogue
registry. A human supplies curated UsageTrees or bilingual pattern content; there is no competing
layout model and no automatic pattern extraction. The existing compiler and example gates validate
an isolated committed snapshot before GitHub receives a new branch, commit and pull request. A click
cannot write to `main`; human review and repository CI decide what merges. Creating a PR records a
publication attempt, while a verified merge permits the ingest to become `published`.

The MV3 extension is deliberately a thin evidence collector. Temporary page access captures semantic
facts and screenshots, submits them to the server and opens Studio. It holds neither a classifier nor
GitHub credentials. Studio is the working environment, not a second source of catalogue truth.

The trade-off is deliberate: accepting a good screenshot does not eliminate the work of authoring a
correct composition. That work stays visible and reviewable instead of being hidden inside an
open-ended agent. Embeddings, automatic equivalence, crawling and automatic merge are not prerequisites.

## Mirra shared context

Group calls, decisions, and chat digests are auto-committed under `.mirra-i15230/`.
Treat `.mirra-i15230/CONTEXT.md` as shared ground truth — Mirra injects it into the
group's AI context; keep it current and it propagates to everyone's tools.
Call transcripts: `.mirra-i15230/calls/YYYY/MM/DD-HHmm-<slug>.md`.

This repo is linked to a Mirra team space. When you do work here, record it
in the team's shared ledger. Publish an update card only when the burst
produced news the team should hear unprompted — routine work closes on the
ledger and publishes nothing. Load the `mirra` skill (top-level index;
`mirra-ledger` has the ops and the bar for what makes a card).
If the skills aren't installed:
`curl -fsSL https://raw.githubusercontent.com/Oz-Networks/mirra-sdk/main/skills/install.sh | bash`.

# Article distribution operations

This directory is the durable handoff between the repository and a Codex Cloud session. It keeps
the website independent of a marketing platform while making each distribution cycle repeatable
and reviewable.

## Sources of truth

- `distribution-plan.json`: prioritized campaigns and individual placements.
- `distribution-plan.schema.json`: structural contract for the queue.
- `campaigns/{campaign-id}/{placement-id}.md`: reviewed copy for one concrete post.
- `CODEX-CLOUD-PLAYBOOK.md`: the complete recurring workflow and review gates.

The same article slug may appear in later campaigns. A campaign may also contain multiple
placements for the same channel, such as an X launch and a follow-up seven days later.

No external post is authorized merely because files exist in this directory. Publishing always
requires explicit user approval for the exact copy and destination.

# OSS improvement and distribution operations

This directory is the durable handoff between the repository and the weekly Devin automation. The
primary loop improves OSS usefulness, trust, adoption, and measurement. Article distribution is an
optional, explicitly approved workflow rather than the default weekly task.

## Sources of truth

- `distribution-plan.json`: prioritized campaigns and individual placements.
- `distribution-plan.schema.json`: structural contract for the queue.
- `campaigns/{campaign-id}/{placement-id}.md`: reviewed copy for one concrete post.
- `CODEX-CLOUD-PLAYBOOK.md`: the weekly improvement workflow and review gates. The legacy filename
  is retained because the active automation references it.

The same article slug may appear in later campaigns. A campaign may also contain multiple
placements for the same channel, such as an X launch and a follow-up seven days later.

Sponsorship is an internal sustainability outcome and a monthly lagging indicator. It must not
override user value or become the public editorial voice. No external post is authorized merely
because files exist here; publishing always requires approval for the exact copy, destination, and
account.

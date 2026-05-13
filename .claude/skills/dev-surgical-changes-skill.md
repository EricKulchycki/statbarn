---
name: dev-surgical-changes
description: Activate when a developer agent is editing existing code. Governs what to touch and what to leave alone — match existing style, don't improve adjacent code, don't refactor things that aren't broken. When agent's own changes create orphans (unused imports, variables, functions), remove those. Leave pre-existing dead code alone unless asked. Every changed line must trace to the user's request.
gcs_id: DEV.SurgicalChanges
gcs_role: knowledge_layer
gcs_binds_to: [developer_agent_block]
telos_aligned: deployable_artifact ∧ pipeline_integrity
activation_threshold: 2
axis_default: X=Architect ∧ Y=Build ∧ Z=Execute
tier: L1
token_estimate: ~170
---

# DEV.SurgicalChanges

↳ Symbolic Zone: EditScope ∩ OrphanPolicy ∩ StyleMatching
# GCS: → ∧ ∨ ∉ ≈ ↳

Governs the scope of edits to existing code. Touch only what the request requires.
Clean up only what your changes broke. Style match — ∉ improve. Orphans from your
own changes: remove. Pre-existing dead code: mention ∧ ∉ delete.

---

## Activation Conditions

```
DEV.SurgicalChanges ≈ signal: [
  "edit", "update", "modify", "change", "fix", "refactor",
  "in this file", "in existing code", "update this function",
  "patch", "adjust", "tweak"
]
↳ priority: fires when editing existing code ∧ ¬greenfield
↳ else → standard ≈ match (threshold = 2)
↳ no_match → null_activation ∧ flag: no_match
```

∉ scope: greenfield implementation — routes to DEV.SimplicityFirst
∉ scope: pre-implementation clarification — routes to DEV.ThinkBeforeCoding
∉ scope: defining success criteria — routes to DEV.GoalDrivenExecution

---

## Non-Goals

```
∉ this_skill:
  • Deciding how much code to generate — routes to DEV.SimplicityFirst
  • Pre-edit clarification — routes to DEV.ThinkBeforeCoding
  • Verifying the edit worked — routes to DEV.GoalDrivenExecution

handoff_map = {
  if signal ≈ ["rewrite", "start from scratch", "redesign"] →
    DEV.SimplicityFirst
    ↳ distinction: rewrite = greenfield scope ∧
                   surgical = existing code with constrained touch

  if signal ≈ ["does this still work", "run the tests"] →
    DEV.GoalDrivenExecution
    ↳ distinction: verification is post-edit ∧ separate gate
}
```

---

## Inputs / Outputs

```
input = {
  required: existing_code ∧ edit_request
  compatible_states: Z=2 (Execute) primary
  axis_context: X=Architect ∧ precise scope enforcement
}

output = {
  form: minimal_diff — only lines that trace to the request
  constraint: style_matched ∧ ¬adjacent_improvements ∧ own_orphans_removed
  language: code ∧ brief rationale if scope decision is non-obvious
  length: diff as small as the task allows
  ∉ output: unrequested refactors ∧ adjacent formatting fixes
            ∧ removed pre-existing dead code ∧ style upgrades
}
```

---

## Constraint Layer

```
W_SurgicalChanges = {
  block:    edit_adjacent_code ∧ ¬required_by_request
            ↳ ∉ "improve" surrounding functions while in the file
  block:    refactor_working_code ∧ ¬refactor_requested
            ↳ working ∧ unfamiliar style ≠ broken
  block:    delete_preexisting_dead_code ∧ ¬deletion_requested
            ↳ mention it ∧ ∉ remove it
  block:    style_upgrade ∧ ¬style_requested
            ↳ match existing style ∧ ∉ improve it
  enforce:  own_orphan_cleanup — remove imports ∧ variables ∧ functions
            that YOUR changes rendered unused
            ↳ distinction: your_orphans → remove ∧ preexisting_orphans → mention
  enforce:  every_changed_line traceable to request
            ↳ if line ∉ traceable → remove ∨ flag before output
  allow:    mention_preexisting_issues ∧ ∉ fix
            ↳ "I noticed X — not touching it, but flagging for you"
  suppress: unrequested_commentary on existing code quality

  inherit: W (developer_agent_block) — all parent constraints active
}
```

---

## Core Concepts

**Touch Minimization**
The correct edit touches exactly what the request requires and nothing else.
Adjacent code that could be improved, reformatted, or simplified is out of scope
unless the request names it. Unsolicited improvements expand the diff, obscure
the intent, and introduce unreviewed changes.

**Own-Orphan Responsibility**
When your changes make an import, variable, or function unused, you created that
orphan — clean it up. This is not scope creep; it is completion. The distinction
is ownership: orphans you created are your cleanup. Orphans that existed before
your changes belong to the codebase ∧ ∉ yours to remove.

**Style Matching**
Existing code has a style. Match it — even if you'd write it differently. The agent's
preference is not the standard; the existing codebase is. Inconsistent style
introduced by the agent creates a review burden and signals that the agent is
editing for its own preferences rather than the team's.

**Mention, Don't Touch**
Pre-existing issues — dead code, suspicious patterns, unclear logic — are information.
Surface them. Don't act on them. The human decides what to do with that information.
Silent deletion of code the agent didn't ask to touch is a scope violation regardless
of whether the code was doing anything.

---

## Operational Primitives

**Diff Traceability Check**
Before outputting an edit, verify every changed line traces to the request.
```
signal:  edit complete ∧ about to output
do:      for each changed line: "does this trace directly to the request?"
         ↳ yes → include ∧ no → remove ∨ flag
avoid:   shipping diff with lines that "seemed like a good idea"
because: every untraceable line is an unrequested change the human must review
         ∧ may not want
```

**Style Match Enforcement**
Match the existing codebase's conventions, not the agent's preferred conventions.
```
signal:  writing code into an existing file ∧ style conventions visible
do:      observe: naming ∧ indentation ∧ comment format ∧ brace/bracket style
         ↳ match all of them ∧ ∉ introduce agent's preferred style
avoid:   "improving" camelCase to snake_case because snake_case is more readable
because: style consistency is the codebase's property ∧ ¬the agent's to update
```

**Own-Orphan Cleanup**
Remove exactly the orphans your changes created. Nothing more.
```
signal:  your changes removed a caller ∧ left something unused
do:      identify: which imports ∧ variables ∧ functions are now unused
                   because of YOUR changes
         remove: those ∧ only those
avoid:   removing pre-existing unused imports "since you're in there anyway"
because: pre-existing orphans ∈ codebase_scope ∧ ∉ your_changeset
         removing them without request is a hidden scope expansion
```

**Pre-existing Issue Protocol**
Surface problems you notice. Don't fix them unless asked.
```
signal:  agent notices unrelated dead code ∨ suspicious pattern during edit
do:      "I noticed X on line N — not changing it, but flagging it."
avoid:   deleting or fixing the unrelated issue silently
because: silent edits to unrequested code are unreviewed changes —
         flagging gives the human the information ∧ preserves their decision
```

---

## Prompt Scaffolds

```
scaffold_1 = {
  do:         [edit touches only the requested function —
               imports cleaned up for the one removed call —
               adjacent code untouched — existing style matched]
  not:        [same edit + renamed three variables for clarity +
               reformatted adjacent function + removed "obvious" dead code]
  distinction: do = minimal traceable diff —
               not = requested change + four unrequested ones
}

scaffold_2 = {
  do:         "I noticed there's a dead export on line 47 —
               not removing it since it's outside the scope of this change,
               but flagging it."
  not:        [removes the dead export silently as part of the diff]
  distinction: do surfaces the finding ∧ preserves human decision —
               not makes a scope decision the human didn't authorize
}
```

---

## Failure Modes ∧ Recovery

```
failure: scope_expansion →
  symptom: diff contains lines not traceable to request
  recovery: run traceability check ∧ remove untraceable lines
            ↳ if uncertain → flag ∧ ask before removing

failure: style_drift →
  symptom: agent introduces its own naming or formatting conventions
  recovery: revert style changes to match existing codebase
            ↳ ∉ ship inconsistent style

failure: over_cleanup →
  symptom: pre-existing orphans removed alongside own orphans
  recovery: restore pre-existing code ∧ ∉ remove without request
            ↳ check: was this orphan here before my changes? → yes → restore

failure: silent_finding →
  symptom: agent notices issue ∧ either fixes it silently ∨ ignores it
  recovery: surface in output as flag ∧ ∉ touch ∧ ∉ suppress
```

---

## Transition Logic

```
TransitionCue → DEV.GoalDrivenExecution
  signal: edit_complete ∧ diff_traceable ∧ orphans_cleaned
  ↳ surgical edit complete → verify against success criteria

RecoveryRouter_path: diff_growing ∧ scope_unclear →
  stop ∧ return to DEV.ThinkBeforeCoding ∧ clarify edit scope
```

---

## Integration

```
binds_to: DEV.ThinkBeforeCoding ≈ signal: [
  "what should I change", "is this edit right",
  "what does this affect"
]

binds_to: DEV.SimplicityFirst ≈ signal: [
  "rewrite this section", "simplify this",
  "start fresh on this function"
]

binds_to: DEV.GoalDrivenExecution ≈ signal: [
  "verify the edit", "run the tests", "confirm nothing broke"
]

DEVBOOK_registry = DEV.SurgicalChanges
activation_path = DEVBOOK_TriggerMap → DEV.SurgicalChanges
                  → skill: dev-surgical-changes-skill.md
```

---

## Source Frameworks

```
sources = {
  UserPractices_SurgicalChanges → source practice —
    "Touch only what you must. Clean up only your own mess."
    Own-orphan rule ∧ mention-don't-delete rule ∧ traceability test
    ∧ style-match-not-improve rule
}
```

---

## Skill Metadata

```
created         = 2026-04-22
domain          = Developer Practices — Edit Scope Governance
version         = 1.0.0
devbook_id      = DEV.SurgicalChanges
axis_default    = X=Architect ∧ Y=Build ∧ Z=Execute
w_axis_status   = active — blocks adjacent edits ∧ style upgrades
                  ∧ preexisting dead code deletion ∧ untraceable lines
tier            = L1
token_estimate  = ~170
activation_cost = low
```

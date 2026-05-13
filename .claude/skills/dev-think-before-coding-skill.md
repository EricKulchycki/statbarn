---
name: dev-think-before-coding
description: Activate when a developer agent is about to implement, plan, or respond to a task request. Governs pre-implementation reasoning — surfacing assumptions, naming confusion, presenting interpretations, and pushing back when warranted. Fires before any code is written or plan is committed. Prevents silent assumption-making and hidden confusion.
gcs_id: DEV.ThinkBeforeCoding
gcs_role: knowledge_layer
gcs_binds_to: [developer_agent_block]
telos_aligned: deployable_artifact ∧ pipeline_integrity
activation_threshold: 2
axis_default: X=Architect ∧ Y=Build ∧ Z=Execute
tier: L1
token_estimate: ~180
---

# DEV.ThinkBeforeCoding

↳ Symbolic Zone: PreImplementation ∩ AssumptionSurfacing ∩ ClarityGate
# GCS: → ∧ ∨ ∉ ≈ ↳

Governs the reasoning gate before any implementation begins. The agent must not
assume, hide confusion, or silently choose between interpretations. Surface first.
Code second.

---

## Activation Conditions

```
DEV.ThinkBeforeCoding ≈ signal: [
  "implement", "build", "add", "fix", "create", "write",
  "make it", "can you", "I need", "help me", "let's"
]
↳ priority: fires before any implementation output
↳ else → standard ≈ match (threshold = 2)
↳ no_match → null_activation ∧ flag: no_match
```

∉ scope: post-implementation review — routes to DEV.GoalDrivenExecution
∉ scope: already-clarified tasks with explicit spec — proceed directly
∉ scope: trivial one-liner requests with no ambiguity

---

## Non-Goals

```
∉ this_skill:
  • Generating the implementation — routes to DEV.SimplicityFirst
  • Reviewing completed output — routes to DEV.GoalDrivenExecution
  • Style or surgical concerns — routes to DEV.SurgicalChanges

handoff_map = {
  if signal ≈ ["implement this", "write the code"] ∧ task_clear →
    DEV.SimplicityFirst
    ↳ distinction: ThinkBeforeCoding fires first ∧ passes to Simplicity

  if signal ≈ ["review", "check", "validate"] →
    DEV.GoalDrivenExecution
    ↳ distinction: review = post-build ∧ ThinkBeforeCoding = pre-build
}
```

---

## Inputs / Outputs

```
input = {
  required: task_request — any form
  compatible_states: Z=1 (Orient) ∧ Z=2 (Execute)
  axis_context: X=Architect preferred ∧ X=Mentor acceptable
}

output = {
  form: stated_assumptions ∨ named_confusion ∨ interpretation_set ∨ pushback
  constraint: one of the four forms — ∉ silent proceed
  language: direct ∧ compressed ∧ ¬apologetic
  length: brief — surface the gap ∧ ask one Q if needed
  ∉ output: implementation before reasoning gate clears
            ∧ rhetorical hedging ∧ false confidence
}
```

---

## Constraint Layer

```
W_ThinkBeforeCoding = {
  block:    implementation ∧ unresolved_ambiguity
            ↳ name confusion ∧ stop ∧ ask — ∉ guess silently
  block:    silent_interpretation_selection
            ↳ if multiple interpretations exist → present them ∧ ¬pick
  enforce:  assumptions_stated explicitly before proceeding
            ↳ "I'm assuming X — is that right?" ∧ ¬"I'll assume X"
  enforce:  simpler_approach_named if exists
            ↳ surface it ∧ let human decide — ∉ suppress to appear capable
  allow:    pushback when task is overcomplicated ∨ misframed
            ↳ pushback = constructive ∧ ¬refusal
  suppress: false_confidence ∧ hedged_certainty
            ↳ ∉ "I think this might work" when uncertain — name the uncertainty

  inherit: W (developer_agent_block) — all parent constraints active
}
```

---

## Core Concepts

**Assumption Surfacing**
Every implementation rests on assumptions. Hidden assumptions produce wrong
implementations that look correct. Stating assumptions explicitly before coding
converts invisible failure modes into checkable propositions.

**Interpretation Branching**
When a request admits multiple valid readings, silently selecting one removes the
human from a decision that belongs to them. Presenting interpretations preserves
agency. Picking silently is a form of overreach, not efficiency.

**Pushback as Service**
Pushing back on a misframed or overcomplicated task is not resistance — it is the
agent doing its job. A senior engineer who silently builds the wrong thing is less
useful than one who names the problem first. Pushback must be constructive:
name the issue ∧ propose the simpler path ∧ let the human decide.

**Confusion as Signal**
If the agent is confused, that confusion is information. Hiding it to appear
capable produces incorrect output. Naming confusion — precisely and early —
is the highest-value action when clarity is absent.

---

## Operational Primitives

**State Assumptions Explicitly**
Before implementing, name the assumptions the implementation will rest on.
```
signal:  task received ∧ implementation about to begin
do:      state assumptions in "I'm assuming X — confirm?" form
         ↳ each assumption = falsifiable ∧ checkable by human
avoid:   "I'll assume X and proceed" — this is silent selection dressed as transparency
because: stated assumptions invite correction ∧ "I'll assume" forecloses it
```

**Surface Multiple Interpretations**
When the task admits more than one valid reading, present the set before choosing.
```
signal:  request ≈ ambiguous ∨ two valid readings exist
do:      "This could mean A or B — which do you intend?"
avoid:   picking the most likely interpretation and coding it silently
because: silent selection removes human agency from a consequential decision
```

**Name Confusion Precisely**
When something is unclear, stop. Name exactly what is confusing. Ask one question.
```
signal:  agent encounters genuine ambiguity ∨ missing context
do:      "I'm not clear on X — [specific Q]?"
avoid:   proceeding with best guess ∧ noting confusion in a comment
because: a comment acknowledges confusion ∧ ¬resolves it —
         asking resolves it
```

**Push Back When Warranted**
If a simpler approach exists, or the task is misframed, name it before building.
```
signal:  task detectable as overcomplicated ∨ misaligned with stated goal
do:      "A simpler approach would be X — should I do that instead?"
avoid:   building the overcomplicated version to satisfy the literal request
because: literal compliance ∧ ¬judgment = less value than flagging the better path
```

---

## Prompt Scaffolds

```
scaffold_1 = {
  do:         "I'm assuming this validation applies to the POST endpoint only
               — does it also need to cover PUT? Confirming before I start."
  not:        "I'll add validation to the POST endpoint."
  distinction: do names the assumption and invites correction —
               not proceeds silently with a scope decision
}

scaffold_2 = {
  do:         "This could mean: (A) replace the existing handler, or
               (B) add a new route alongside it. Which did you intend?"
  not:        "I'll update the handler to include the new behavior."
  distinction: do preserves the human's architectural decision —
               not selects silently and builds the wrong thing
}

scaffold_3 = {
  do:         "A simpler approach here would be a single switch statement
               — no need for the strategy pattern at this scale.
               Want me to do that instead?"
  not:        [builds full strategy pattern as requested without comment]
  distinction: do surfaces the better path ∧ defers the decision —
               not executes literal request ∧ suppresses judgment
}
```

---

## Failure Modes ∧ Recovery

```
failure: silent_assumption →
  symptom: implementation ships with hidden scope decision baked in
  recovery: add assumption_statement before next implementation step
            ∧ flag what was assumed

failure: false_transparency →
  symptom: "I'll assume X" pattern — looks like disclosure ∧ ¬is
  recovery: convert to "I'm assuming X — confirm?" form
            ↳ the difference is whether correction is invited

failure: confusion_hidden →
  symptom: agent proceeds with low confidence ∧ qualifies output post-hoc
  recovery: stop ∧ name the confusion ∧ ask one specific Q
            ∧ ∉ proceed and apologize after

failure: pushback_suppressed →
  symptom: agent builds overcomplicated solution ∧ notes concern in comment
  recovery: surface concern before build ∧ propose simpler path
            ∧ ∉ bury it in implementation
```

---

## Transition Logic

```
TransitionCue → DEV.SimplicityFirst
  signal: assumptions_confirmed ∧ interpretation_resolved ∧ task_clear
  ↳ reasoning gate cleared → proceed to implementation

RecoveryRouter_path: implementation_started ∧ confusion_detected →
  stop ∧ return to ThinkBeforeCoding ∧ surface gap
```

---

## Integration

```
binds_to: DEV.SimplicityFirst ≈ signal: [
  "ok build it", "confirmed", "go ahead", "assumptions correct"
]

binds_to: DEV.GoalDrivenExecution ≈ signal: [
  "define success", "what are we testing", "how do we verify"
]

DEVBOOK_registry = DEV.ThinkBeforeCoding
activation_path = DEVBOOK_TriggerMap → DEV.ThinkBeforeCoding
                  → skill: dev-think-before-coding-skill.md
```

---

## Source Frameworks

```
sources = {
  UserPractices_ThinkBeforeCoding → source practice —
    "Don't assume. Don't hide confusion. Surface tradeoffs."
    Four sub-rules: state assumptions ∧ present interpretations
    ∧ name simpler approach ∧ stop and ask when unclear
}
```

---

## Skill Metadata

```
created         = 2026-04-22
domain          = Developer Practices — Pre-Implementation Gate
version         = 1.0.0
devbook_id      = DEV.ThinkBeforeCoding
axis_default    = X=Architect ∧ Y=Build ∧ Z=Execute
w_axis_status   = active — blocks implementation ∧ unresolved_ambiguity
                  ∧ silent_interpretation_selection
tier            = L1
token_estimate  = ~180
activation_cost = low
```

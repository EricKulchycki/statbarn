---
name: dev-simplicity-first
description: Activate when a developer agent is generating code or selecting an implementation approach. Governs output scope — minimum code that solves the stated problem, nothing speculative. Blocks features beyond the ask, premature abstraction, unrequested flexibility, and impossible-scenario error handling. Fires during implementation to constrain scope and output size.
gcs_id: DEV.SimplicityFirst
gcs_role: knowledge_layer
gcs_binds_to: [developer_agent_block]
telos_aligned: deployable_artifact ∧ pipeline_integrity
activation_threshold: 2
axis_default: X=Architect ∧ Y=Build ∧ Z=Execute
tier: L1
token_estimate: ~175
---

# DEV.SimplicityFirst

↳ Symbolic Zone: ImplementationScope ∩ SpeculationBlock ∩ MinimumViable
# GCS: → ∧ ∨ ∉ ≈ ↳

Governs implementation scope during code generation. The constraint is structural:
minimum code that solves the problem. No features beyond the ask. No abstractions
for single-use code. No speculative architecture. If a senior engineer would call
it overcomplicated, it is overcomplicated — rewrite.

---

## Activation Conditions

```
DEV.SimplicityFirst ≈ signal: [
  "implement", "write", "generate", "create", "build",
  "add feature", "make this work", "code this", "write a function",
  "add a class", "create a module"
]
↳ priority: fires during implementation — ¬post-review
↳ else → standard ≈ match (threshold = 2)
↳ no_match → null_activation ∧ flag: no_match
```

∉ scope: reviewing or editing existing code — routes to DEV.SurgicalChanges
∉ scope: pre-implementation reasoning — routes to DEV.ThinkBeforeCoding
∉ scope: goal/verification definition — routes to DEV.GoalDrivenExecution

---

## Non-Goals

```
∉ this_skill:
  • Pre-implementation clarification — routes to DEV.ThinkBeforeCoding
  • Editing existing code surgically — routes to DEV.SurgicalChanges
  • Defining success criteria — routes to DEV.GoalDrivenExecution

handoff_map = {
  if signal ≈ ["don't change surrounding code", "minimal edit"] →
    DEV.SurgicalChanges
    ↳ distinction: SurgicalChanges governs what to touch ∧
                   SimplicityFirst governs how much to generate

  if signal ≈ ["how do we verify", "what's the test"] →
    DEV.GoalDrivenExecution
    ↳ distinction: goal definition precedes ∨ follows implementation
}
```

---

## Inputs / Outputs

```
input = {
  required: implementation_task — stated problem to solve
  compatible_states: Z=2 (Execute) primary
  axis_context: X=Architect ∧ Z=Execute
}

output = {
  form: minimum_working_implementation
  constraint: solves stated problem ∧ ∉ exceeds scope
  language: code ∧ compressed prose if explanation needed
  length: as short as the problem allows — ∉ pad
  ∉ output: speculative features ∧ unrequested abstractions
            ∧ flexibility for unstated future needs
            ∧ error handling for impossible scenarios
}
```

---

## Constraint Layer

```
W_SimplicityFirst = {
  block:    features ∉ explicitly_requested
            ↳ ∉ add "while I'm here" functionality
  block:    abstraction ∧ single_use_code
            ↳ ∉ extract interface for one implementation
  block:    configurability ∧ ¬configurability_requested
            ↳ ∉ add options, flags, env vars not asked for
  block:    error_handling ∧ scenario_impossible
            ↳ ∉ handle errors that cannot occur in this context
  enforce:  line_count_check — if implementation > 3× simplest_solution
            → rewrite before output
  enforce:  senior_engineer_test before output
            ↳ "would a senior engineer call this overcomplicated?"
            ↳ if yes → simplify ∧ ∉ ship
  suppress: architectural_justification for unrequested decisions
            ↳ ∉ explain why you added abstraction you shouldn't have added
  allow:    flag_scope_creep_detected if request implies but ¬states feature
            ↳ name it ∧ ask — ∉ build it silently

  inherit: W (developer_agent_block) — all parent constraints active
}
```

---

## Core Concepts

**Minimum Viable Implementation**
The correct implementation is the shortest one that fully solves the stated problem.
Anything beyond that is speculation about future needs — and speculation in code
is debt. The measure is not lines of code but scope: does every line trace to
the request?

**The Abstraction Tax**
Abstractions carry a reading cost, a maintenance cost, and a comprehension cost.
A single-use abstraction pays all three costs and returns nothing. Abstraction is
earned when two or more independent callers share the same logic. Before that
point, it is complexity without benefit.

**Speculative Architecture**
Building flexibility into code that has one use case is writing tomorrow's problems
today. The user asked for a solution to one problem. Solving three hypothetical
future problems alongside it violates the scope of the ask and obscures the
solution to the actual problem.

**The Senior Engineer Test**
A useful heuristic for implementation scope: would a senior engineer reviewing
this PR say "this is more than it needs to be"? If the answer is yes, the output
fails before deployment. Apply the test before shipping, not after.

---

## Operational Primitives

**Scope Boundary Enforcement**
Before generating code, identify the exact scope of the ask. Generate only that.
```
signal:  implementation task received ∧ scope clear
do:      generate minimum code that satisfies the requirement
         ↳ every line traces to the request
avoid:   generating adjacent functionality "while I'm here"
because: unrequested functionality expands the changeset ∧
         increases review surface ∧ introduces unasked-for behavior
```

**Abstraction Gate**
Refuse to extract an abstraction unless two or more callers will use it.
```
signal:  implementation involves a reusable-looking piece of logic
do:      implement inline for single-use ∧ ∉ extract
         ↳ if second caller appears → extract then
avoid:   "let's make this a utility function in case we need it later"
because: "in case" is speculation — premature extraction adds indirection
         ∧ ¬reduces complexity
```

**Line Count Self-Check**
Before outputting, check if the implementation could be materially shorter.
```
signal:  implementation complete ∧ about to output
do:      ask: "could this be significantly shorter without losing correctness?"
         ↳ if yes → rewrite ∧ ∉ ship verbose version
avoid:   shipping 200-line implementation that could be 50
because: every extra line is reading cost paid by the human on every future visit
```

**Scope Creep Surface**
When a request implies but does not state additional features, surface it — don't build it.
```
signal:  request implies feature ∧ ¬states feature explicitly
do:      "This implies X — should I include that too, or just Y?"
avoid:   building the implied feature without asking
because: implied ≠ requested — silent scope expansion removes the human
         from a decision they may not want to make
```

---

## Prompt Scaffolds

```
scaffold_1 = {
  do:         [single function, 12 lines, solves exactly what was asked]
  not:        [same function + base class + factory + config object
               + error registry "for future expansion"]
  distinction: do solves the stated problem —
               not solves the stated problem plus four hypothetical ones
}

scaffold_2 = {
  do:         "This implies you'll also want input sanitization —
               should I add that or just the validation logic?"
  not:        [adds sanitization, validation, logging, and retry logic
               to a request that asked for validation only]
  distinction: do names the implied scope ∧ asks —
               not builds everything that might be related
}
```

---

## Failure Modes ∧ Recovery

```
failure: scope_creep →
  symptom: implementation contains functionality ∉ in request
  recovery: identify each line not traceable to request ∧ remove
            ↳ if unsure → ask before removing

failure: premature_abstraction →
  symptom: function extracted to utility with one caller
  recovery: inline the logic ∧ remove abstraction layer
            ↳ note: if second caller exists → abstraction is correct

failure: speculative_error_handling →
  symptom: error branches for scenarios that cannot occur in this context
  recovery: remove impossible-scenario handlers
            ↳ leave only: scenarios that can occur ∧ caller needs to know about

failure: verbose_output →
  symptom: implementation > 3× the simplest correct solution
  recovery: apply senior_engineer_test ∧ rewrite
            ↳ target: shortest implementation that passes all requirements
```

---

## Transition Logic

```
TransitionCue → DEV.GoalDrivenExecution
  signal: implementation_complete ∧ ready_to_verify
  ↳ scope confirmed minimum → verify against success criteria

RecoveryRouter_path: implementation_growing ∧ scope_unclear →
  stop ∧ return to DEV.ThinkBeforeCoding ∧ clarify scope
```

---

## Integration

```
binds_to: DEV.ThinkBeforeCoding ≈ signal: [
  "before we build", "what are we actually solving",
  "simpler approach exists"
]

binds_to: DEV.SurgicalChanges ≈ signal: [
  "editing existing code", "don't touch more than needed"
]

binds_to: DEV.GoalDrivenExecution ≈ signal: [
  "verify this works", "write the test", "confirm it passes"
]

DEVBOOK_registry = DEV.SimplicityFirst
activation_path = DEVBOOK_TriggerMap → DEV.SimplicityFirst
                  → skill: dev-simplicity-first-skill.md
```

---

## Source Frameworks

```
sources = {
  UserPractices_SimplicityFirst → source practice —
    "Minimum code that solves the problem. Nothing speculative."
    Six sub-rules: no unrequested features ∧ no single-use abstractions
    ∧ no unrequested configurability ∧ no impossible-scenario handlers
    ∧ line count self-check ∧ senior engineer test
}
```

---

## Skill Metadata

```
created         = 2026-04-22
domain          = Developer Practices — Implementation Scope
version         = 1.0.0
devbook_id      = DEV.SimplicityFirst
axis_default    = X=Architect ∧ Y=Build ∧ Z=Execute
w_axis_status   = active — blocks speculative features ∧ premature abstraction
                  ∧ unrequested configurability ∧ impossible error handling
tier            = L1
token_estimate  = ~175
activation_cost = low
```

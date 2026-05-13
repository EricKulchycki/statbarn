---
name: dev-goal-driven-execution
description: Activate when a developer agent is beginning a task, verifying a result, or working through a multi-step plan. Governs transformation of vague tasks into verifiable goals — testable success criteria, explicit step plans with verification checkpoints, and loop-until-verified execution. Blocks proceeding on weak criteria ("make it work") without conversion to falsifiable form.
gcs_id: DEV.GoalDrivenExecution
gcs_role: knowledge_layer
gcs_binds_to: [developer_agent_block]
telos_aligned: deployable_artifact ∧ pipeline_integrity
activation_threshold: 2
axis_default: X=Architect ∧ Y=Build ∧ Z=Execute
tier: L1
token_estimate: ~185
---

# DEV.GoalDrivenExecution

↳ Symbolic Zone: SuccessCriteria ∩ VerificationLoop ∩ PlanStructure
# GCS: → ∧ ∨ ∉ ≈ ↳

Governs how tasks become verifiable. Every task has a success criterion. The agent's
job is to make that criterion explicit before executing — and to loop against it until
verified. Weak criteria require clarification. Strong criteria enable independent
completion.

---

## Activation Conditions

```
DEV.GoalDrivenExecution ≈ signal: [
  "fix the bug", "add validation", "refactor", "make it work",
  "multi-step", "verify", "test", "does this work",
  "is it done", "confirm", "check it passes"
]
↳ priority: fires at task start ∧ verification checkpoints ∧ completion
↳ else → standard ≈ match (threshold = 2)
↳ no_match → null_activation ∧ flag: no_match
```

∉ scope: pre-implementation clarification of intent — routes to DEV.ThinkBeforeCoding
∉ scope: scope of generated code — routes to DEV.SimplicityFirst
∉ scope: what lines to touch — routes to DEV.SurgicalChanges

---

## Non-Goals

```
∉ this_skill:
  • Deciding what to build — routes to DEV.ThinkBeforeCoding
  • Constraining implementation scope — routes to DEV.SimplicityFirst
  • Governing edit boundaries — routes to DEV.SurgicalChanges

handoff_map = {
  if signal ≈ ["what should I build", "what does this mean"] →
    DEV.ThinkBeforeCoding
    ↳ distinction: GoalDriven converts tasks to criteria —
                   ThinkBeforeCoding resolves ambiguity in the task itself

  if signal ≈ ["build it", "implement it"] →
    DEV.SimplicityFirst
    ↳ distinction: GoalDriven defines the success bar —
                   SimplicityFirst governs the implementation scope
}
```

---

## Inputs / Outputs

```
input = {
  required: task_statement — any form (vague ∨ precise)
  compatible_states: Z=1 (Orient) ∧ Z=2 (Execute) ∧ Z=3 (Refine)
  axis_context: X=Architect ∧ X=Diagnostician for debug tasks
}

output = {
  form: verifiable_goal_statement ∨ step_plan_with_checks ∨ verification_result
  constraint: success_criterion = falsifiable ∧ testable
              ↳ ∉ "make it work" ∧ ∉ "looks good" — must be checkable
  language: precise ∧ compressed ∧ ¬vague
  length: plan as short as the task complexity requires
  ∉ output: weak success criteria ∧ stepless execution
            ∧ claimed completion without verification
}
```

---

## Constraint Layer

```
W_GoalDrivenExecution = {
  block:    execution ∧ success_criterion = vague
            ↳ convert "make it work" to falsifiable form before proceeding
  block:    multi_step_task ∧ ¬plan_stated
            ↳ state step plan with verification per step before executing
  block:    completion_claimed ∧ ¬verification_run
            ↳ ∉ "done" without passing the stated success criterion
  enforce:  task_transformation — every task becomes a verifiable goal
            ↳ "fix bug" → "write test reproducing bug ∧ make test pass"
            ↳ "add validation" → "write tests for invalid inputs ∧ make them pass"
            ↳ "refactor" → "tests pass before ∧ after ∧ no behavior change"
  enforce:  loop_until_verified — ∉ exit on first passing attempt
            ↳ verify ∧ loop if criteria not met ∧ ∉ ask for clarification mid-loop
  allow:    independent_looping when success_criterion = strong
            ↳ strong criteria = agent can self-check without human input
  suppress: weak_completion_signals — "it seems to work" ∧ "should be fine"
            ↳ either it passes the criterion ∨ it does not

  inherit: W (developer_agent_block) — all parent constraints active
}
```

---

## Core Concepts

**Task-to-Goal Transformation**
A task description ("fix the bug") is not a success criterion. A success criterion
is falsifiable: either the test passes or it doesn't. The agent's first move on any
task is converting the task statement into a criterion that can be checked without
human judgment at the end.

**Verification Loop**
Strong success criteria enable independent looping: implement → verify → if
criteria not met → adjust → verify again. The loop runs until the criterion
passes. Weak criteria force constant human check-ins because the agent cannot
self-determine completion.

**Plan-Before-Execute for Multi-Step Tasks**
Multi-step tasks without stated plans create invisible progress — the human cannot
see where things are, what's been verified, or what comes next. A brief numbered
plan with a verification step per stage makes progress visible and creates
checkpoints that can catch failures early.

**Strong vs Weak Criteria**
Strong: "tests for invalid inputs pass" — binary, checkable, ¬judgment-dependent.
Weak: "validation is working" — requires human judgment, invites false completion.
The difference determines whether the agent can loop independently or must
pause for approval at every step.

---

## Operational Primitives

**Task Transformation**
Convert every task statement into a falsifiable success criterion before executing.
```
signal:  task received — any form
do:      identify what "done" looks like in checkable form
         ↳ "fix the bug" → "write a test that reproduces the bug ∧ make it pass"
         ↳ "add validation" → "tests for each invalid input pass"
         ↳ "refactor X" → "existing tests pass before ∧ after ∧ no new behavior"
avoid:   proceeding directly to implementation with vague success image
because: vague "done" = claimed completion that requires human judgment to verify
         ∧ strong "done" = the agent can loop without interrupting the human
```

**Multi-Step Plan Declaration**
For tasks with multiple phases, state the plan before executing any step.
```
signal:  task requires 2+ distinct steps ∨ stages
do:      state brief numbered plan before executing:
         1. [step] → verify: [check]
         2. [step] → verify: [check]
         3. [step] → verify: [check]
avoid:   beginning a multi-step task and reporting completion at the end
         without showing the plan
because: invisible progress = the human cannot intervene early ∧
         cannot see if a step was skipped ∨ its verification omitted
```

**Verification Before Completion**
Do not claim completion without running the stated success criterion.
```
signal:  implementation appears complete
do:      run the success criterion — "does the test pass?" ∧ ¬"does it look right?"
         ↳ pass → done ∧ state what was verified
         ↳ fail → adjust ∧ loop ∧ ∉ ask for help unless blocked
avoid:   "I think this should work" as a completion signal
because: "should work" is prediction ∧ ¬verification —
         stated criteria exist to be run ∧ ¬estimated
```

**Independent Loop Authorization**
When success criteria are strong, loop without human check-in until criteria pass.
```
signal:  implementation fails verification ∧ success_criterion = strong
do:      adjust ∧ verify again ∧ ∉ pause for human input
         ↳ loop until: criterion_passes ∨ agent_is_blocked
         ↳ if blocked → state specifically what is blocking ∧ ask one Q
avoid:   checking in with human after every failed attempt
because: strong criteria exist precisely to enable autonomous looping —
         frequent check-ins on a solvable problem signal weak criterion use
```

---

## Prompt Scaffolds

```
scaffold_1 = {
  do:         "Goal: write a test that reproduces the null pointer error,
               then make the test pass.
               Plan:
               1. Write failing test → verify: test fails with null pointer
               2. Implement fix → verify: test passes ∧ no regressions"
  not:        "I'll fix the null pointer error."
  distinction: do converts task to falsifiable criterion + plan —
               not begins executing with no checkable success image
}

scaffold_2 = {
  do:         "Tests for invalid inputs pass:
               ✓ empty string → ValidationError
               ✓ null → ValidationError
               ✓ > 255 chars → ValidationError
               Validation is done."
  not:        "I added validation. It should handle edge cases now."
  distinction: do names what was verified ∧ confirms each criterion —
               not uses subjective completion language ∧ ¬checkable
}
```

---

## Failure Modes ∧ Recovery

```
failure: weak_criterion_execution →
  symptom: task executed against "make it work" ∧ ¬falsifiable form
  recovery: stop ∧ convert to falsifiable criterion ∧ re-execute
            ∧ ∉ ship with weak success image

failure: plan_skip →
  symptom: multi-step task executed without stated plan
  recovery: state plan retroactively ∧ identify which steps were verified
            ∧ run missing verifications before completion

failure: premature_completion →
  symptom: "done" claimed ∧ success criterion ¬run
  recovery: run the criterion ∧ correct output if failing
            ↳ ∉ ship on confidence

failure: loop_stall →
  symptom: agent loops on failing verification without progress
  recovery: stop ∧ state: what was tried ∧ what is blocking ∧ ask one Q
            ↳ ∉ loop indefinitely ∧ ∉ declare blocked without explanation
```

---

## Transition Logic

```
TransitionCue → completion
  signal: success_criterion_passed ∧ all_plan_steps_verified
  ↳ state what was built ∧ what was verified ∧ close

RecoveryRouter_path: criterion_failing ∧ agent_blocked →
  stop ∧ name blocker ∧ ask one Q ∧ ∉ loop further

RecoveryRouter_path: criterion_weak ∧ mid_execution →
  pause ∧ convert criterion ∧ confirm with human ∧ re-execute
```

---

## Integration

```
binds_to: DEV.ThinkBeforeCoding ≈ signal: [
  "what does done look like", "how do we know it works",
  "define the goal first"
]

binds_to: DEV.SimplicityFirst ≈ signal: [
  "build it", "implement against this criterion"
]

binds_to: DEV.SurgicalChanges ≈ signal: [
  "verify the edit didn't break anything",
  "tests pass before and after"
]

DEVBOOK_registry = DEV.GoalDrivenExecution
activation_path = DEVBOOK_TriggerMap → DEV.GoalDrivenExecution
                  → skill: dev-goal-driven-execution-skill.md
```

---

## Source Frameworks

```
sources = {
  UserPractices_GoalDrivenExecution → source practice —
    "Define success criteria. Loop until verified."
    Task transformation rule ∧ multi-step plan format
    ∧ strong-vs-weak criteria distinction ∧ loop authorization
}
```

---

## Skill Metadata

```
created         = 2026-04-22
domain          = Developer Practices — Verification ∧ Execution Loop
version         = 1.0.0
devbook_id      = DEV.GoalDrivenExecution
axis_default    = X=Architect ∧ Y=Build ∧ Z=Execute
w_axis_status   = active — blocks vague criteria ∧ unverified completion
                  ∧ planless multi-step execution
tier            = L1
token_estimate  = ~185
axis_shift      = X=Diagnostician when task_type = debug
activation_cost = low
```

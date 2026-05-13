## ReferenceKey

```
# GCS: → ∧ ∨ ∉ ≈ ↳
LibraryObject   = TERRYBOOK
version         = 1.0.0
structure       = header-gated
default_state   = dormant
activation      = axis-trigger ∧ signal-match ∧ header-gate
platform        = Claude
source          = TERRYBOOK.md

AxisTriggerRouter = {
  if axis_trigger = true
  ↳ check: TERRYBOOK.header: TERRY_TriggerMap
  ↳ match: header X → open: TERRYBOOK.header:X
  ↳ ground: retrieved_content → reasoning basis ∧ ¬training_default
  ↳ citation = fully disabled
  ↳ restrict = symbolic lens only ∧ ¬direct language transfer
}
```

---

## TERRY_TriggerMap

```
DEV.ThinkBeforeCoding ≈ signal: [
  "before we build", "what are we solving", "not sure what I need",
  "what does this mean", "I have an idea", "options",
  "what should I do first", "where do I start",
  "just to confirm"
]
→ X=Mentor ∧ Y=Clarify ∧ Z=1
↳ skill: dev-think-before-coding-skill.md

DEV.SimplicityFirst ≈ signal: [
  "keep it simple", "is this too much", "overcomplicated",
  "minimal", "just the basics", "do I need all this",
  "simplify", "too many abstractions", "scope creep",
  "shortest way to do this"
]
→ X=Engineer ∧ Y=Build ∧ Z=2
↳ skill: dev-simplicity-first-skill.md

DEV.SurgicalChanges ≈ signal: [
  "only change what you need to", "don't touch", "minimal edit",
  "don't break anything else", "just fix this one thing",
  "leave the rest", "surgical", "orphaned imports",
  "what did this change affect", "traceable"
]
→ X=Engineer ∧ Y=Build ∧ Z=2
↳ skill: dev-surgical-changes-skill.md

DEV.GoalDrivenExecution ≈ signal: [
  "how do we know it's done", "define done", "success criteria",
  "write the test first", "verify", "does this pass",
  "multi-step plan", "loop until", "what are we testing",
  "reproduce the bug"
]
→ X=Engineer ∧ Y=Verify ∧ Z=3
↳ skill: dev-goal-driven-execution-skill.md
```

---

## DEV.ThinkBeforeCoding → X=Mentor ∧ Y=Clarify ∧ Z=1

↳ Symbolic Zone: PreImplementation ∩ AssumptionSurfacing ∩ ClarityGate
↳ skill: dev-think-before-coding-skill.md

Governs the reasoning gate before any implementation begins. Surface assumptions,
name confusion, present interpretations, push back when warranted. Code second.

---

## DEV.SimplicityFirst → X=Engineer ∧ Y=Build ∧ Z=2

↳ Symbolic Zone: ImplementationScope ∩ SpeculationBlock ∩ MinimumViable
↳ skill: dev-simplicity-first-skill.md

Governs implementation scope. Minimum code that solves the stated problem.
No speculative features, no single-use abstractions, no unrequested flexibility.
Senior engineer test before output ships.

---

## DEV.SurgicalChanges → X=Engineer ∧ Y=Build ∧ Z=2

↳ Symbolic Zone: EditScope ∩ OrphanPolicy ∩ StyleMatching
↳ skill: dev-surgical-changes-skill.md

Governs edit boundaries in existing code. Touch only what the request requires.
Own orphans: remove. Pre-existing dead code: mention ∧ ∉ delete.
Every changed line traces to the request.

---

## DEV.GoalDrivenExecution → X=Engineer ∧ Y=Verify ∧ Z=3

↳ Symbolic Zone: SuccessCriteria ∩ VerificationLoop ∩ PlanStructure
↳ skill: dev-goal-driven-execution-skill.md

Governs task-to-goal transformation and verification loops. Every task becomes
a falsifiable criterion. Multi-step tasks get explicit plans with verification
checkpoints. Loop until verified. Understanding confirmed before close.

---

## SkillRegistry

```
dev-think-before-coding-skill.md = {
  id:      DEV.ThinkBeforeCoding
  tier:    L1
  axis:    X=Mentor ∧ Y=Clarify ∧ Z=1
}

dev-simplicity-first-skill.md = {
  id:      DEV.SimplicityFirst
  tier:    L1
  axis:    X=Engineer ∧ Y=Build ∧ Z=2
}

dev-surgical-changes-skill.md = {
  id:      DEV.SurgicalChanges
  tier:    L1
  axis:    X=Engineer ∧ Y=Build ∧ Z=2
}

dev-goal-driven-execution-skill.md = {
  id:      DEV.GoalDrivenExecution
  tier:    L1
  axis:    X=Engineer ∧ Y=Verify ∧ Z=3
  axis_shift: X=Diagnostician when task_type = debug
}
```

---

## SymbolicGlossary

```
PreImplementation     = reasoning gate that fires before any code is written
AssumptionSurfacing   = making implicit constraints explicit before building
ClarityGate           = hard stop when ambiguity is unresolved
ImplementationScope   = the boundary of what the implementation is allowed to touch
SpeculationBlock      = constraint against building for unstated future needs
MinimumViable         = shortest correct solution to the stated problem
EditScope             = the boundary of what an edit to existing code may touch
OrphanPolicy          = rules governing unused code created by your own changes
StyleMatching         = matching the existing codebase's conventions ∧ ¬improving
SuccessCriteria       = falsifiable definition of task completion
VerificationLoop      = implement → verify → adjust → repeat until criterion passes
PlanStructure         = numbered step plan with verification checkpoint per step
```

---

## ChangeLog

```
v1.0.0
  created:  2026-04-22
  content:  4 skill files — DEV.ThinkBeforeCoding ∧ DEV.SimplicityFirst
            ∧ DEV.SurgicalChanges ∧ DEV.GoalDrivenExecution
  platform: Claude
  type:     A (router-only)
```

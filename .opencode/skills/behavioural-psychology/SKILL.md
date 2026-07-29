---
name: behavioural-psychology
description: "Behavioural psychology knowledge base — cognitive biases, motivation models, heuristics, and ethical design patterns. Use when: psychology, behaviour, motivation, bias, dark pattern, nudge, habit, onboarding, gamification, cognition, decision-making, ethics"
---

# Behavioural Psychology Skill

Comprehensive knowledge base of cognitive science principles for product design. Use this skill when analyzing user behaviour, motivation, or decision-making.

## Cognitive Biases (20 biases)

| Bias | Mechanism | Design Impact | Ethical Risk |
|------|-----------|---------------|--------------|
| Confirmation Bias | Seek info confirming beliefs | Personalization algos | Echo chambers |
| Anchoring | First info sets reference | Price anchoring, defaults | Manipulative pricing |
| Framing Effect | Response depends on presentation | Loss-framed CTAs | Fear-based conversion |
| Default Effect | Stick with pre-set options | Opt-out vs opt-in | Privacy violations |
| Social Proof | Follow others' behaviour | Reviews, testimonials | Fake social proof |
| Scarcity | Value limited availability | "Only 2 left" | False urgency |
| Loss Aversion | Losses hurt more than gains | Free trial expiry | Retention tricks |
| IKEA Effect | Value what we create | Customization features | False sense of control |
| Endowment Effect | Overvalue what we own | Ownership framing | Manipulative trials |
| Peak-End Rule | Judge by peak + end | Best moment + exit | Ignoring overall experience |
| Paradox of Choice | Too many options = paralysis | Progressive disclosure | Choice overload |
| Decoy Effect | Third option shifts preference | Pricing tiers | Hidden manipulation |
| Hyperbolic Discounting | Prefer now over later | Rewards now vs later | Short-term engagement |
| Sunk Cost | Continue due to past investment | Subscription retention | Trap users |
| Dunning-Kruger | Unskilled overestimate ability | Skill-based features | Misleading confidence |
| Halo Effect | One trait colors perception | Celebrity endorsements | Misleading associations |
| Availability Heuristic | Judge by ease of recall | Recent reviews | Recency bias |
| Bandwagon Effect | Adopt because others do | Trending features | Herd mentality |
| Curse of Knowledge | Assume others know what you know | Expert interfaces | Poor onboarding |
| Spotlight Effect | Overestimate how noticed we are | Social features | Anxiety triggers |

## Motivation Models (5 models)

### Fogg Behaviour Model
B = MAP — Behaviour happens when Motivation, Ability, and Prompt converge simultaneously.
- **Motivation**: High (pleasure/pain, hope/fear, acceptance/rejection)
- **Ability**: Easy (time, money, physical effort, brain cycles, social deviance, non-routine)
- **Prompt**: Timely (spark for low M, facilitator for high M but low A, signal for high M+A)

### Self-Determination Theory
Three innate psychological needs:
- **Autonomy**: Choice, volition, self-direction
- **Competence**: Mastery, growth, feedback
- **Relatedness**: Connection, belonging, community

### Habit Loop (Cue-Routine-Reward)
1. **Cue**: Trigger (external or internal)
2. **Routine**: Behaviour
3. **Reward**: Satisfaction
4. **Investment**: Time/effort that primes next cue

### Nudge Theory
Libertarian paternalism — steer without restricting choice:
- Defaults, salience, social norms, pre-commitment, feedback, framing

### Goal Gradient Effect
People accelerate effort as they approach a goal — progress bars, milestones, streaks all leverage this.

## Cognitive Load Types

| Type | Definition | Design Response |
|------|------------|-----------------|
| Intrinsic | Task complexity | Chunking, progressive disclosure |
| Extraneous | Unnecessary mental effort | Remove clutter, consistent patterns |
| Germane | Schema-building | Meaningful feedback, mental models |

## Ethical Design Principles

1. **Informed consent** — Users understand what they're agreeing to
2. **Autonomy** — Users can easily opt out
3. **Transparency** — Algorithms and recommendations are explainable
4. **Privacy** — Data collection is minimal and justified
5. **Fairness** — No exploitation of vulnerable populations
6. **Accountability** — Design decisions have responsible owners

## Dark Pattern Detection

| Pattern | Description | Ethical Alternative |
|---------|-------------|-------------------|
| Confirmshaming | Guilt users into action | Positive framing |
| Hidden Costs | Reveal costs at checkout | Upfront pricing |
| Roach Motel | Easy to enter, hard to leave | One-click cancellation |
| Misdirection | Draw attention away from opt-out | Clear choices |
| Forced Action | Require unwanted action | Separate concerns |
| Sneak into Basket | Auto-add items | Explicit selection |
| Trick Questions | Confusing double negatives | Plain language |
| Privacy Zuckering | Share more than intended | Granular controls |

## Output Format

When analyzing a design or flow, use this structure:
```
PRINCIPLE: {name}
MECHANISM: {how it works}
LOCATION: {specific element/flow}
USER IMPACT: {what user experiences}
ETHICAL CONCERN: {none/low/medium/high}
RECOMMENDATION: {ethical alternative}
```

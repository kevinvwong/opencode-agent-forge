---
name: design-system
description: "Design system intelligence — styles, colors, typography, patterns, and accessibility rules. Use when: design, ui, ux, layout, component, style, css, interface, visual, responsive, accessibility, color palette, typography, design system, figma, tailwind, shadcn"
---

# Design System Skill

Comprehensive design knowledge base for building professional UI/UX. Use this skill when designing interfaces, components, or design systems.

## Style Knowledge Base (20 styles)

| Style | Best For | Key Traits |
|-------|----------|------------|
| Minimalism | Enterprise apps, dashboards | Clean, lots of whitespace, limited color |
| Glassmorphism | Modern SaaS, financial dashboards | Frosted glass, backdrop blur, layered |
| Neumorphism | Health/wellness, meditation | Soft shadows, subtle depth, monochromatic |
| Brutalism | Portfolios, artistic projects | Bold borders, raw typography, high contrast |
| Bento Grid | Dashboards, product pages | Organized boxes, modular, asymmetric |
| Dark Mode | Night apps, coding platforms | Dark bg, reduced blue light, accent glow |
| Soft UI | Enterprise, SaaS | Soft shadows, rounded corners, subtle depth |
| AI-Native | AI products, chatbots | Conversational, minimal, glow accents |
| Cyberpunk | Gaming, crypto, tech | Neon, dark bg, glitch effects, vibrant |
| Organic | Wellness, sustainability | Natural shapes, earth tones, fluid curves |
| Accessible | Government, healthcare | WCAG AAA, high contrast, large targets |
| Motion-Driven | Portfolios, storytelling | Animation-first, scroll-triggered, smooth |
| Retro-Futurism | Gaming, music, entertainment | Vintage meets sci-fi, neon, chrome |
| Y2K | Fashion, Gen Z brands | Bold colors, grunge textures, playful |
| Spatial UI | VR/AR, spatial computing | Depth, 3D, visionOS-inspired |
| E-Ink | Reading apps, newspapers | Paper-like, grayscale, minimal |
| Memphis | Creative agencies, music | Geometric patterns, bold colors, playful |
| Vaporwave | Music, gaming, portfolios | Synthwave, neon grids, retro gradients |
| HUD/Sci-Fi | Sci-fi games, cybersecurity | Futuristic, data-dense, glowing elements |
| Pixel Art | Indie games, retro tools | Blocky, limited palette, nostalgic |

## Color Psychology (12 moods)

| Mood | Hex Range | Best For |
|------|-----------|----------|
| Trust | #2563eb → #1d4ed8 | Banking, enterprise, healthcare |
| Energy | #ea580c → #dc2626 | Fitness, gaming, food delivery |
| Calm | #0891b2 → #0e7490 | Meditation, wellness, spa |
| Luxury | #d4a843 → #b8912e | Premium brands, jewelry, high-end |
| Growth | #16a34a → #15803d | Finance, environment, health |
| Creative | #7c3aed → #6d28d9 | Design tools, agencies, art |
| Warmth | #f59e0b → #d97706 | Hospitality, food, lifestyle |
| Playful | #db2777 → #be185d | Kids, entertainment, social |
| Professional | #475569 → #334155 | B2B, consulting, legal |
| Tech | #0f172a → #1e293b | SaaS, developer tools, startups |
| Nature | #65a30d → #4d7c0f | Organic, outdoor, sustainability |
| Romance | #f43f5e → #e11d48 | Dating, beauty, fashion |

## Typography Pairings (12 pairs)

| Mood | Heading | Body | Google Fonts |
|------|---------|------|-------------|
| Elegant | Playfair Display | Inter | serif+sans classic |
| Modern | Inter | Inter | Clean mono-family |
| Creative | Space Grotesk | Inter | Tech-forward |
| Editorial | Merriweather | Source Sans | News/reading |
| Playful | Fredoka | Nunito | Rounded friendly |
| Premium | Cormorant Garamond | Montserrat | Luxury editorial |
| Technical | JetBrains Mono | Inter | Code/documentation |
| Minimal | DM Sans | DM Sans | Clean sans |
| Bold | Bebas Neue | Roboto | Impact headlines |
| Warm | Lora | Open Sans | Friendly serif |
| Artistic | Syne | Work Sans | Modern display |
| Natural | Fraunces | DM Sans | Organic soft |

## Accessibility Rules

- Text contrast: 4.5:1 minimum (WCAG AA), 7:1 preferred (AAA)
- Touch targets: 44×44px minimum
- Focus indicators: 2px outline, 2px offset
- prefers-reduced-motion: respect with `@media`
- Font scaling: support up to 200% without breakage
- Color not sole indicator: use icons + labels + patterns
- Screen reader: aria-labels on all interactive elements
- Error messages: associate with inputs via aria-describedby

## Anti-Patterns by Industry

| Industry | Avoid |
|----------|-------|
| Banking/Finance | Neon colors, playful fonts, dark patterns |
| Healthcare | Low contrast, small text, decorative fonts |
| E-commerce | Hidden fees, confusing checkout, auto-subscribe |
| Education | Cluttered layouts, distracting animations |
| Government | Complex navigation, jargon, small targets |
| Kids | Auto-play video, data collection, dark patterns |
| News | Clickbait, auto-refresh, intrusive ads |
| AI Products | Purple/pink gradients, fake human avatars |

## Output Format

When generating a design system, use this structure:
```
PATTERN: {name}
STYLE: {name} — {key traits}
COLORS: Primary={hex} Secondary={hex} CTA={hex} BG={hex} Text={hex}
TYPOGRAPHY: {heading} / {body} — {mood}
EFFECTS: {animations, transitions, hover states}
ANTI-PATTERNS: {what to avoid}
CHECKLIST: [ ] contrast 4.5:1 [ ] touch 44px [ ] focus visible [ ] reduced-motion [ ] responsive
```

---
name: code-review
description: "Code review knowledge base — vulnerability patterns, anti-patterns, security rules, and quality checks. Use when: review, audit, security, vulnerability, code review, CR, PR review, static analysis, bug hunt, quality, lint, inspect, verify"
---

# Code Review Skill

Comprehensive knowledge base for security-focused code review. Use this skill when reviewing code changes, pull requests, or auditing codebases.

## Vulnerability Taxonomy (P0-P4)

### P0 — Critical (immediate fix required)

| Vulnerability | Detection | Example |
|--------------|-----------|---------|
| SQL Injection | Unsanitized input in query strings | `SELECT * FROM users WHERE id = '${input}'` |
| Command Injection | User input in exec/spawn | `exec("rm " + filename)` |
| XSS (Reflected) | Unsanitized URL params in HTML | `innerHTML = params.get("q")` |
| XSS (Stored) | User input saved then rendered | `comment.text` rendered without escaping |
| Auth Bypass | Missing auth checks on protected routes | No middleware on `/admin/*` |
| Privilege Escalation | Missing role checks | Any user can access admin APIs |
| Insecure Deserialization | Untrusted data deserialized | `pickle.loads(user_input)` |
| SSRF | User-controlled URLs fetched server-side | `fetch(user_provided_url)` |
| Path Traversal | User input in file paths | `open("../" + filename)` |

### P1 — High (fix in current sprint)

| Vulnerability | Detection | Example |
|--------------|-----------|---------|
| CSRF | Missing anti-forgery tokens | State-changing GET requests |
| IDOR | Missing ownership checks | `GET /api/order/123` returns any order |
| Weak Crypto | MD5, SHA1, DES, ECB mode | `crypto.createHash("md5")` |
| Hardcoded Secrets | Keys/tokens in source | `API_KEY = "sk-..."` |
| JWT Weakness | alg: none, weak secret, no expiry | `jwt.decode(token, verify=False)` |
| Open Redirect | User-controlled redirect URLs | `redirect(next_url)` |
| Race Condition | TOCTOU, async state mutation | Check-then-use without lock |
| Memory Leak | Unreleased references | Event listeners never removed |

### P2 — Medium (fix this sprint or next)

| Vulnerability | Detection | Example |
|--------------|-----------|---------|
| N+1 Queries | Loop DB queries | `for u in users: u.orders()` |
| Mass Assignment | Unfiltered model updates | `User.update(request.body)` |
| Insufficient Logging | Missing audit trail | Silent 401 instead of log |
| Weak Rate Limiting | No throttle on auth endpoints | Unlimited login attempts |
| Insecure Direct Object Ref | Predictable IDs | Sequential order numbers |
| Missing Input Validation | Unvalidated types/lengths | `int(user_input)` without try/catch |

### P3 — Low (fix when convenient)

| Vulnerability | Detection | Example |
|--------------|-----------|---------|
| Verbose Error Messages | Stack traces to users | `except: return str(e)` |
| Missing Headers | No CSP, HSTS, X-Frame-Options | Missing security headers |
| Unused Imports | Dead code | `import os` never used |
| Debug Code Left In | console.log, print, debugger | `console.log("here")` |
| Inconsistent Naming | Mixed conventions | `user_name` and `userName` |

### P4 — Cosmetic (note but don't block)

| Vulnerability | Detection | Example |
|--------------|-----------|---------|
| Missing Comments | Undocumented public APIs | No JSDoc/TSDoc |
| Long Functions | >50 lines | Single function doing too much |
| Deep Nesting | >3 levels | `if > for > if > switch` |
| Magic Numbers | Unexplained constants | `if (x > 86400)` |

## Anti-Patterns by Language

### JavaScript/TypeScript
- `any` types without justification
- `!` non-null assertions without comments
- Direct DOM manipulation in React
- Missing useEffect cleanup
- Inline styles without design tokens
- `var` instead of `const`/`let`

### Python
- `except: pass` silently swallowing errors
- Mutable default arguments: `def f(x=[])`
- `from module import *` polluting namespace
- Not using context managers for files/connections
- `is` for value comparison instead of `==`

### Rust
- `unwrap()` without comment or alternative
- Unsafe blocks without safety justification
- Missing `#[must_use]` on result-returning fns
- `clone()` where reference would work

### Go
- `_` ignored errors without comment
- Missing context propagation
- Global state/mutables
- `interface{}` without type assertion guard

## Security Headers Checklist

| Header | Value | Purpose |
|--------|-------|---------|
| Content-Security-Policy | `default-src 'self'` | XSS prevention |
| Strict-Transport-Security | `max-age=31536000` | HTTPS enforcement |
| X-Frame-Options | `DENY` | Clickjacking prevention |
| X-Content-Type-Options | `nosniff` | MIME sniffing prevention |
| Referrer-Policy | `strict-origin-when-cross-origin` | Referrer leakage |
| Permissions-Policy | `camera=(), microphone=()` | Feature restriction |

## Output Format

For each finding, use this structure:
```
## [P{0-4}] [{category}] {title}
File: {path}:{line}
Why: {one-sentence explanation of the issue and impact}
Fix: {concrete code suggestion}
```
Start with highest severity. If no issues found: "No issues found."

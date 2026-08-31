---
name: cleanup
description: >-
  Removes dead code and unnecessary log statements from the codebase.
  Use when you want to clean up legacy code, eliminate unused functions/variables/files,
  and strip out console logs or other non-essential debug output.
---

# Cleanup Skill

This skill scans the codebase to:

- Find and remove dead code (unused functions, variables, imports, files).
- Remove unnecessary logs (such as `console.log`, `console.debug`, or equivalent debug statements).
- Ensure the codebase is more maintainable and free from legacy clutter.
- Leave business-critical or security audit logs intact, but strip debug/noise.

**Usage:**  
Run as part of routine maintenance or prior to release to ensure a clean and production-ready source tree.

**Typical Triggers:**  
"Remove dead code", "strip out logs", "clean up debug output", "ensure no unused functions", "legacy cleanup"

**Note:**  
Review automated removal suggestions before acceptance. Some logs may be relevant for tracing or structured logging.
For all removals, cross-check with test coverage and quality gates (see `quality-gating` rule).

## Example requests

- "Remove all unused code and strip debug logs in `src/`."
- "Cleanup dead functions and console statements across the app."
- "Ensure no leftover debug output before we merge this to main."

## See Also

- `.cursor/rules/quality-gating.mdc` for gates (Knip for dead code, lint rules for log suppression)
- `.cursor/rules/security-first.mdc` for secret logging rules

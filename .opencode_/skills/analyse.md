---
description:  Ghis - Analyze the existing HTML/Vite before making any changes.
agent: plan
permissions:
  - action: edit
    resource: "*"
    effect: deny
  - action: shell
    resource: "*"
    effect: deny
---
# Analyze React/Vite Project

Analyze the complete React + TypeScript + Vite codebase.

## Instructions

Do not modify any files.

Inspect the project first:

* package.json
* vite.config.*
* tsconfig*.json
* src/
* public/
* routing configuration
* state management
* API/data layer
* tests
* ESLint/Prettier configuration

Analyze:

1. Project structure
2. Architecture
3. React components
4. Hooks
5. State management
6. TypeScript
7. API/data access
8. Routing
9. Performance
10. Dependencies
11. Security
12. Testing
13. Code quality
14. Technical debt

For every important finding provide:

* Priority: Critical / High / Medium / Low
* File
* Problem
* Why it matters
* Recommendation

Finish with:

## Summary

### Strengths

### Critical Problems

### Technical Debt

### Top 10 Recommendations

### Suggested Improvement Order

Do not change source code.

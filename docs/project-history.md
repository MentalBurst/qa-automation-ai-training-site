# Project History QA Lab

Architecture decisions, changes, and expansion notes for future AI sessions.

---

## Session 2026-05-15 Initial Build (v1.0.0)

### What was built
Complete initial platform with 20 progressive scenarios, 3 shared CSS files, 2 shared JS files, metadata, and documentation.

### Architecture Decisions

#### CSS Architecture
- **3-file split**: `base.css` (reset/tokens), `components.css` (UI components), `layout.css` (page structure)
- All pages link all 3 files no per-page CSS files
- CSS custom properties in `:root` single source of truth for colors, spacing, radius
- Color scheme: white + light gray background + accent blue (#4361ee)

#### JavaScript Architecture
- `utils.js` Shared: Toast, Modal, initTabs, initAccordions, Validate, Store, delay(), setLoading
- `nav.js` Navigation injection helper
- Each page has its own inline `<script>` block
- No module system simple `'use strict'` IIFE pattern
- No external libraries, no CDN, no ES modules

#### Locator Strategy
- Every interactive element has `data-testid`
- IDs are stable (except Scenario 18 which intentionally uses dynamic IDs)
- ARIA attributes added throughout for `getByRole()` support
- `aria-live` regions for toast/announcement assertions

#### Intentional Anti-Patterns (for training purposes)
- Scenario 18: dynamic IDs that change each render
- Scenario 18: element that disappears within 2 seconds
- Scenario 18: CSS-hidden element vs display:none (different behavior in automation)
- Scenario 04: custom dropdown that looks like a select but is NOT (breaks selectOption())

### File Naming Convention
```
pages/{nn}-{slug}.html
  nn   = 01..20 (zero-padded)
  slug = kebab-case description
```

### Difficulty Distribution
- Beginner:     01-05 (5 scenarios)
- Intermediate: 06-10 (5 scenarios)
- Advanced:     11-15 (5 scenarios)
- Expert:       16-20 (5 scenarios)

---

## Expansion Notes (for future sessions)

### Potential new scenarios (21+)
- Infinite scroll / virtual list
- WebSocket simulation
- Keyboard shortcut handlers
- Context menus (right click)
- Browser dialog (alert/confirm/prompt) native browser dialogs
- Multi-page navigation with history
- Print/PDF simulation
- Network throttle scenarios (requires server)
- Cookie management
- Window/tab switching simulation

### Potential improvements
- Add a progress tracking feature (mark scenarios as "completed")
- Add Gherkin/BDD sidebar panel per scenario
- Add "copy selector" button for key testIds
- Dark mode toggle
- i18n / multi-language support

### If adding new pages
1. Add page file in `pages/`
2. Link from `index.html` grid cards
3. Add entry to `metadata/scenarios.json`
4. Append entry to this file
5. Update README scenario count (currently 20)
6. Update hero stat `data-testid="stat-scenarios"` value

### CSS Token Additions
To change accent color: update `--color-accent` in `base.css` `:root`
Currently: `#4361ee` (blue)
Alternatives: `#7c3aed` (purple), `#0ea5e9` (sky), `#10b981` (emerald)

---

## Known Issues (v1.0.0)

| Scenario | Issue | Workaround |
|----------|-------|-----------|
| 16 | iFrame content built via srcdoc may not work with some strict CSP configs | Use a local server instead of file:// protocol |
| 13 | HTML5 DnD events may behave differently in Firefox vs Chrome | Test with page.dragAndDrop() in Playwright |
| 19 | Canvas pixel reading blocked if opened via file:// in some browsers | Use local HTTP server |

---

## Dependencies (always zero)
This project intentionally has no npm dependencies, no CDN imports, and no build process.
This decision is permanent do not add framework dependencies.

---

*QA Lab Project History Maintained by QA Lab Team*


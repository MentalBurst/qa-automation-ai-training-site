# Contributing to QA Lab

Thank you for your interest in contributing!

---

## Adding a New Scenario

1. **Create the page file**: `pages/NN-slug.html`
   - Follow existing page structure (header, page-header, demo-area, info-panel, footer)
   - Use consistent CSS classes from `base.css`, `components.css`, `layout.css`
   - Add `data-testid` to every interactive element
   - Include: Test Objective, Automation Challenges, Atomic Steps, Pitfalls

2. **Link from homepage**: Add a scenario card in `index.html`
   - Set correct `data-difficulty` attribute
   - Set correct `data-testid="card-NN"`

3. **Update metadata**: Add entry to `metadata/scenarios.json`

4. **Update docs**: Add row to the scenario table in `docs/README.md`

5. **Record history**: Add entry in `docs/project-history.md`

---

## Code Style

- **No external libraries** vanilla JS only
- **Use `data-testid`** on all interactive elements
- **IIFE pattern** for JavaScript: `(function () { ... })();`
- **CSS classes** from shared files avoid inline styles unless needed for dynamic values
- **Consistent naming**: `btn-action`, `input-field`, `error-field`, `section-name`

---

## File Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>NN Scenario Title | QA Lab</title>
  <link rel="stylesheet" href="../css/base.css" />
  <link rel="stylesheet" href="../css/components.css" />
  <link rel="stylesheet" href="../css/layout.css" />
</head>
<body>
<!-- HEADER (copy from any existing page) -->
<!-- MAIN -->
<main class="site-main">
  <div class="page-header"><!-- breadcrumb, badges, h1, description --></div>
  <div class="page-layout">
    <div>
      <div class="demo-area"><!-- interactive demo --></div>
    </div>
    <aside class="sidebar"><!-- test objective, selectors --></aside>
  </div>
  <div class="info-panel"><!-- atomic steps, pitfalls --></div>
</main>
<!-- FOOTER -->
<script src="../js/utils.js"></script>
<script>(function () { /* page logic */ })();</script>
</body>
</html>
```

---

*QA Lab Contributing Guide v1.0.0*


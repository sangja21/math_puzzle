# Implementation Plan - Coding Principles UI White/Light Theme Switch

## 1. Goal
Switch the UI tone and manner of the "Coding Principles" section (`src/app/coding` and its sub-pages) from a Dark/Cosmic theme to a Clean/White theme.

## 2. Rationale
The current dark, gradient-heavy theme does not match the desired "educational documentation" tone which should be lighter and more readable. Using a white-based theme offers better readability, a more standard academic feel, and aligns with the user's request.

## 3. Design System Updates
We will adopt a **Slate** color palette (Slate 50 to Slate 900) for a neutral, professional look.

| Element | Current (Dark) | Proposed (Light) |
| :--- | :--- | :--- |
| **Page Background** | `radial-gradient(#0f172a, ...)` | `#f8fafc` (Slate 50) |
| **Container/Card** | `rgba(255,255,255, 0.06)` | `#ffffff` (White, opaque) |
| **Borders** | `rgba(255,255,255, 0.08)` | `#e2e8f0` (Slate 200) |
| **Primary Text** | `#f8fafc` (Slate 50) | `#0f172a` (Slate 900) |
| **Secondary Text** | `rgba(248, 250, 252, 0.7)` | `#475569` (Slate 600) |
| **Shadows** | heavy dark shadows | Soft gray shadows (`0 4px 6px -1px rgba(0, 0, 0, 0.1)`) |
| **Accents** | Neon/Bright gradients | Solid Slate accents or slightly toned-down gradients |

## 4. Modified Files

### A. Main Page (CSS)
- **`src/app/coding/coding.module.css`**
    - Update `.container` to `#f8fafc`.
    - Update `.card` to `#ffffff` with slate borders.
    - Update `.title` and text colors to slate-900.

### B. Lab & Steps Pages (CSS)
- **`src/app/coding/bubble-lab/page.module.css`**
- **`src/app/coding/bubble-steps/page.module.css`**
- **`src/app/coding/selection-lab/page.module.css`**
- **`src/app/coding/selection-steps/page.module.css`**
    - Standardize:
        - `.container` to `#f8fafc`.
        - `.statBox`, `.explainBox`, `.logPanel`: White background + Slate border `#cbd5e1`.
        - `.backButton`: White background + Slate border + Slate text.
        - `.stepList`, `.stepItem`: Adjust for light mode contrast (e.g., light gray bg for item).

### C. Components (Visual Stages CSS)
- **`src/components/bubbleSortStage.module.css`**
    - Update `.stage` container.
    - **CRITICAL**: Update scale beam/pan/line colors (currently white) to Dark/Slate (e.g., `#64748b`) so they are visible on light background.
- **`src/components/selectionSortStage.module.css`**
    - Update `.stage` container.
    - Update cursor/scale lines to Dark/Slate.

## 5. Potential Risks & Mitigation
- **Contrast Loss**: White elements (like the scale beam) on a white background will disappear.
    - *Mitigation*: Explicitly invert these colors to `slate-400` or `slate-600` in the Component CSS.
- **Block Colors**: The blocks (`red`, `orange`, etc.) have specific hex values.
    - *Mitigation*: The text inside blocks is currently dark (`rgba(10,10,10,0.85)`). This remains good.
- **Global Layout Constraints**: If `layout.module.css` forces dark mode styles that cascade.
    - *Mitigation*: Based on file inspections, `page.module.css` classes seem to own their containers.

## 6. Verification Plan
1.  Apply changes to CSS files.
2.  Use the browser tool to capture screenshots of:
    - `/coding`
    - `/coding/bubble-lab` (check visual stage)
    - `/coding/bubble-steps` (check layout)
3.  Verify text is readable and "Scale/Balance" visual elements are visible.

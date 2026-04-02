# Prologue Interface System

## Direction & Feel
- Editorial, calm, writer-first product surfaces with restrained feedback.
- Notifications should reassure without interrupting flow.

## Depth Strategy
- Borders-first structure with very subtle shadow only for transient overlays.
- Toasts use `border + soft shadow` and avoid bright fills.

## Spacing Base Unit
- Base spacing: 4px grid.
- Toast layout: 14px vertical/horizontal content padding, 10px icon-to-copy gap.

## Reusable Patterns
### Action Toasts
- Placement: top-right stack, max 3 visible.
- Variants: `success`, `info`, `error`.
- Success uses Prologue gold accents (`border-gold/35`, `text-gold-dark`), never bright green.
- Body uses `bg-parchment`, `text-ink`, `text-ink-muted` for description.
- Auto-dismiss: ~3.2s with manual close option.
- Trigger toasts for user-facing setting/state changes so actions are always confirmed.

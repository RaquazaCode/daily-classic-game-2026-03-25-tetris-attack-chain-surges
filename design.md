# Design Notes

## Goal
Recreate the pressure of Tetris Attack with a deterministic chain-focused MVP suitable for unattended automation.

## Core Systems
- 10x6 board with seeded panel generation.
- Cursor-based swap input for adjacent panels.
- Automatic rise timer that shifts the board upward.
- Match resolution for horizontal/vertical 3+ groups.
- Cascade-based chain scoring multiplier.

## Twist Used
`chains` from catalog twist candidates. Every cascade in a single resolve cycle increases multiplier depth and score output.

## Controls
- `Enter`: start
- `Arrow Keys`: move cursor
- `Space`/`X`: swap cursor pair
- `P`: pause/resume
- `R`: reset run
- `Shift+R`: hard reset (clear high score)

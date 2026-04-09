"use client"

// Mobile nav functionality is implemented inside Sidebar (which renders both
// desktop and mobile slide-over overlays driven by its `mobileOpen` prop).
// This file exists to satisfy the directory structure documented in CLAUDE.md
// and gives a future split a clean import path.
export { Sidebar as MobileNav } from "./sidebar"

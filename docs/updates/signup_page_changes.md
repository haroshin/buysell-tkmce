# Signup Page Changes — Department & Section Update

**Date:** 2026-05-20  
**Feature:** Correct TKMCE Department List + Smart Section Assignment

---

## Summary

The registration form previously had an outdated and incomplete department list. It was missing **MTech**, **MCA**, **Computer Science & Engineering (AI)**, and **Electrical & Computer Engineering**, and used short abbreviations instead of proper names. Additionally, the section dropdown was always shown (except for MTech), even for departments that only have Section A — causing confusion.

This update:
1. Replaces the entire department list with the exact names from the TKMCE spreadsheet.
2. Introduces **smart section logic** — the section picker only appears for departments that genuinely have multiple sections (A/B/C), while all others auto-assign Section A invisibly, and MTech gets no section at all.

---

## Files Changed

---

### 1. `client/src/utils/constants.js`

#### What Changed

**Before:**
The DEPARTMENTS array had 8 entries with short abbreviations:
- 'Computer Science (CSE)', 'Electronics & Communication (ECE)', etc.
- Missing: MTech, MCA, Computer Science & Engineering (AI), Electrical & Computer Engineering

**After:**
Full correct list from the TKMCE spreadsheet:
```js
export const DEPARTMENTS = [
  'Civil Engineering',
  'Mechanical Engineering',
  'Electrical & Electronics Engineering',
  'Electronics & Communication Engineering',
  'Computer Science and Engineering',
  'Chemical Engineering',
  'Electrical & Computer Engineering',
  'Architecture',
  'Computer Science & Engineering (AI)',
  'MCA',
  'MTech',
];
```

**Two new exported Sets added:**
```js
// Departments that have ONLY Section A — section picker hidden, auto-sets A
export const SINGLE_SECTION_DEPARTMENTS = new Set([
  'Civil Engineering',
  'Electrical & Electronics Engineering',
  'Electronics & Communication Engineering',
  'Computer Science and Engineering',
  'Chemical Engineering',
  'Electrical & Computer Engineering',
  'Architecture',
  'Computer Science & Engineering (AI)',
  'MCA',
]);

// Departments that have NO sections at all (MTech)
export const NO_SECTION_DEPARTMENTS = new Set(['MTech']);
```

#### Why
- Added the missing departments: MTech, MCA, Computer Science & Engineering (AI), Electrical & Computer Engineering.
- Used exact full names matching the college spreadsheet.
- Added two Sets to drive smart section behaviour in the form without hardcoding department names in the UI.

---

### 2. `client/src/pages/Register.jsx`

#### What Changed

**Import updated:**
```js
// Before
import { DEPARTMENTS } from '../utils/constants';

// After
import { DEPARTMENTS, SINGLE_SECTION_DEPARTMENTS, NO_SECTION_DEPARTMENTS } from '../utils/constants';
```

**React import updated:** `useState` → `useState, useEffect`

**New section-logic variables** (computed from selected department):
```js
const hasMultipleSections = formData.department === 'Mechanical Engineering';
const isSingleSection = SINGLE_SECTION_DEPARTMENTS.has(formData.department) && !hasMultipleSections;
const isNoSection = NO_SECTION_DEPARTMENTS.has(formData.department);
const showSectionPicker = hasMultipleSections; // Only Mechanical shows the picker
```

**New useEffect** auto-sets section when department changes:
```js
useEffect(() => {
  if (hasMultipleSections) {
    setFormData((prev) => ({ ...prev, section: '' })); // user must choose
  } else if (isSingleSection) {
    setFormData((prev) => ({ ...prev, section: 'A' })); // auto-assign A
  } else {
    setFormData((prev) => ({ ...prev, section: '' })); // MTech — no section
  }
}, [formData.department]);
```

**Section UI block** — replaced old `department !== 'MTech'` check with smart logic.

---

## Section Assignment Rules (From Spreadsheet)

| Department | Sections | Form Behaviour |
|---|---|---|
| Civil Engineering | A, B | **A / B dropdown shown** |
| Mechanical Engineering | A, B, C | **A / B / C dropdown shown** |
| Electrical & Electronics Engineering | A, B | **A / B dropdown shown** |
| Electronics & Communication Engineering | A, B | **A / B dropdown shown** |
| Computer Science and Engineering | A, B | **A / B dropdown shown** |
| Chemical Engineering | A | Hidden — auto-set Section A |
| Electrical & Computer Engineering | A | Hidden — auto-set Section A |
| Architecture | A | Hidden — auto-set Section A |
| Computer Science & Engineering (AI) | A | Hidden — auto-set Section A |
| MCA | A | Hidden — auto-set Section A |
| MTech | None | Hidden — no section assigned |

---

## No Backend Changes Required

- `server/models/User.js` — section field accepts 'A', 'B', 'C', 'None'. MTech users get 'None' by default. No change needed.
- `server/controllers/messageController.js` — Broker routing logic unchanged. MTech users fall back to admin correctly.

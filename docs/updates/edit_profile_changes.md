# Edit Profile Changes — Department & Section Alignment

**Date:** 2026-05-21  
**Feature:** Edit Profile Smart Section Selection & Database Alignment

---

## Summary

To ensure complete alignment with the registration (signup) form, the student profile edit page (`Profile.jsx`) and register page (`Register.jsx`) include full support for the TKMCE department list and **smart section assignment**.

This update guarantees that:
1. **Section dropdown visibility**: The Section field is visible in both the registration form and the edit profile form for all departments where sections apply (everyone except MTech).
2. **Auto-assigned departments**: For departments that only have Section A (MCA, Architecture, Chemical, etc.), the section field is pre-selected as "Section A" and disabled/locked in the UI, ensuring students cannot choose an invalid section while still clearly seeing their assigned section.
3. **Multi-section departments**: Students from multi-section departments (Mechanical has A/B/C, others have A/B) can choose their section interactively.
4. **Database migration**: Normalized all existing test users' department names (e.g., `'Computer Science (CSE)'` -> `'Computer Science and Engineering'`) and filled missing sections (e.g., `'None'` -> `'A'` for single-section depts) so they perfectly match the standard naming conventions.
5. **Session consistency**: Enhanced login and registration responses to include `phone`, `department`, `passoutYear`, and `section` so that the frontend authentication context receives full profile details immediately without requiring a page reload.

---

## Section Assignment Rules

| Department | Sections | Form Behaviour (Edit & Signup) |
|---|---|---|
| Civil Engineering | A, B | **A / B dropdown interactive** |
| Mechanical Engineering | A, B, C | **A / B / C dropdown interactive** |
| Electrical & Electronics Engineering | A, B | **A / B dropdown interactive** |
| Electronics & Communication Engineering | A, B | **A / B dropdown interactive** |
| Computer Science and Engineering | A, B | **A / B dropdown interactive** |
| Chemical Engineering | A | Disabled — locked to Section A |
| Electrical & Computer Engineering | A | Disabled — locked to Section A |
| Architecture | A | Disabled — locked to Section A |
| Computer Science & Engineering (AI) | A | Disabled — locked to Section A |
| MCA | A | Disabled — locked to Section A |
| MTech | None | Hidden — no section assigned |

---

## Files & Code-Wise Explanation

### 1. Frontend: [Profile.jsx](file:///d:/buysell/webdev/client/src/pages/Profile.jsx)

- Changed `showSectionPicker` to show for all departments except `MTech`.
- Updated the select element to be `disabled` for `isSingleSection` departments, and render a simplified pre-selected option.
- Added a small info text under the disabled dropdown to explain that Section A is auto-assigned.

```jsx
{showSectionPicker && (
  <div className="flex flex-col space-y-1.5">
    <label className="text-sm font-medium text-slate-300">Section</label>
    <select
      value={editForm.section}
      onChange={(e) => setEditForm({ ...editForm, section: e.target.value })}
      className="bg-dark-800 border border-slate-700 text-white rounded-xl px-4 py-2.5 transition-all outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
      id="edit-section"
      required
      disabled={isSingleSection}
    >
      {isSingleSection ? (
        <option value="A">Section A</option>
      ) : (
        <>
          <option value="">Select Section</option>
          <option value="A">Section A</option>
          <option value="B">Section B</option>
          {hasMultipleSections && (
            <option value="C">Section C</option>
          )}
        </>
      )}
    </select>
    {isSingleSection && (
      <p className="text-xs text-primary-400 font-medium">
        Section A is auto-assigned for this department.
      </p>
    )}
  </div>
)}
```

---

### 2. Frontend: [Register.jsx](file:///d:/buysell/webdev/client/src/pages/Register.jsx)

- Applied the exact same visual dropdown locking logic in the registration form. It displays the section field locked to "Section A" for single-section departments, rather than hiding it entirely.

---

### 3. Backend: [authController.js](file:///d:/buysell/webdev/server/controllers/authController.js)

- Updated `registerUser` and `loginUser` response objects to return the complete set of user details so that the auth context is fully populated right from login/register:
```javascript
user: {
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  department: user.department,
  passoutYear: user.passoutYear,
  section: user.section,
  avatar: user.avatar,
  role: user.role,
  isVerified: user.isVerified
}
```

---

### 4. Database Migration Script: [migrate_departments.js](file:///d:/buysell/webdev/server/migrate_departments.js)

- Created and ran a script to migrate existing test users' department names to the standard names and auto-assigned missing section values.
- Cleaned up 8 users' departments and 3 users' sections, bringing the database in line with the new data model.

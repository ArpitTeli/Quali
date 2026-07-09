# Dev Board — Specification

## Overview
Electron desktop app for developers. Reads tasks assigned to them by managers from the shared Google Sheet, updates task status, and adds comments.

---

## Auth

**Auth Google Sheet:** `1HLBEiQ-tGaTdm4Lq6JltGcfBIWcgc528-JKSD4gON2Q`
**Auth Apps Script URL:** `https://script.google.com/macros/s/AKfycbyhkpWsu7OoZrYFdAZxJZ74h0HYp0EkzNP21iCID9UHQBGc-Ugchx3m6M60GkTgDv8dtQ/exec`

| Column | Purpose |
|--------|---------|
| `UID` | User ID |
| `Pass` | Password |
| `Role` | `qualifier`, `manager`, or `developer` |

Login POST:
```json
{ "action": "login", "uid": "...", "password": "..." }
Response: { "success": true, "displayName": "..." }
```

Dev Board app should check that the logged-in user's role is `developer`. Reject other roles.

---

## Shared Google Sheet

**Sheet ID:** `1LWsb7dfw5vQ3DZcLgmN523ALoys9hqYfmft6v-bA9kU`
**Sheet URL:** `https://docs.google.com/spreadsheets/d/1LWsb7dfw5vQ3DZcLgmN523ALoys9hqYfmft6v-bA9kU/edit?usp=sharing`

### Columns Written by Quali (existing)

| Column | Written By | Description |
|--------|-----------|-------------|
| `query` | Qualifier | Search query / lead source |
| `name` | Qualifier | Company or lead name |
| `website` | Qualifier | Website URL |
| `company_phone` | Qualifier | Phone number (+91 prefix stripped) |
| `email` | Qualifier | Contact email |
| `pushed_by` | Qualifier | Display name of the qualifier who pushed |
| `Comments` | Qualifier | Free-text comments from qualifier |
| `Lead Status` | Qualifier | Empty on push |

### Columns Written by Manager (via CRM)

| Column | Written By | Description |
|--------|-----------|-------------|
| `Assigned To` | Manager | UID or name of the developer this lead is assigned to |
| `Pipeline Stage` | Manager | Current pipeline stage |
| `Priority` | Manager | Priority level (High, Medium, Low) |
| `Manager Notes` | Manager | Free-text notes from the manager |
| `Due Date` | Manager | Due date for the task |
| `Created At` | System | Timestamp when the lead was pushed |
| `Updated At` | System | Timestamp of last update |

### Columns Written by Developer (via Dev Board)

| Column | Written By | Description |
|--------|-----------|-------------|
| `Task Status` | Developer | Current status (e.g. To Do, In Progress, Review, Done) |
| `Developer Comments` | Developer | Free-text comments or updates |

---

## Data Flow

```
Manager (CRM)
  │
  │  assigns lead to developer
  │  writes: Assigned To, Pipeline Stage, Priority, Due Date
  │
  ▼
Shared Google Sheet
  │
  │  Dev Board reads rows where Assigned To = current user UID
  │
  ▼
Developer (Dev Board)
  │
  │  updates Task Status
  │  adds Developer Comments
  │
  ▼
Shared Google Sheet (CRM reads back status)
```

---

## Dev Board Apps Script Endpoints

The Dev Board needs its own Apps Script deployment (separate from Quali's and CRM's).

### POST — List My Tasks

```json
Request: {
  "action": "listMyTasks",
  "assignedTo": "dev-uid"
}
Response: {
  "success": true,
  "tasks": [
    {
      "query": "...",
      "name": "...",
      "website": "...",
      "company_phone": "...",
      "email": "...",
      "pushed_by": "...",
      "Comments": "...",
      "Assigned To": "dev-uid",
      "Pipeline Stage": "Contacted",
      "Priority": "High",
      "Manager Notes": "...",
      "Task Status": "To Do",
      "Developer Comments": "",
      "Due Date": "2026-07-15",
      "Created At": "...",
      "Updated At": "..."
    }
  ]
}
```

### POST — Update Task Status

```json
Request: {
  "action": "updateStatus",
  "name": "...",
  "website": "...",
  "taskStatus": "In Progress",
  "assignedTo": "dev-uid"
}
Response: { "success": true }
```

> `assignedTo` is included for validation — a developer can only update their own tasks.

### POST — Add Developer Comment

```json
Request: {
  "action": "addComment",
  "name": "...",
  "website": "...",
  "comment": "Working on this, will update by Friday",
  "assignedTo": "dev-uid"
}
Response: { "success": true }
```

### POST — Get Task Detail

```json
Request: {
  "action": "getTaskDetail",
  "name": "...",
  "website": "..."
}
Response: {
  "success": true,
  "task": {
    "query": "...",
    "name": "...",
    "website": "...",
    "company_phone": "...",
    "email": "...",
    "pushed_by": "...",
    "Comments": "...",
    "Assigned To": "...",
    "Pipeline Stage": "...",
    "Priority": "...",
    "Manager Notes": "...",
    "Task Status": "...",
    "Developer Comments": "",
    "Due Date": "...",
    "Created At": "...",
    "Updated At": "..."
  }
}
```

---

## UI Requirements

- Dark theme (same style as Quali)
- Login screen with role check
- Main view: list/table of tasks assigned to current developer
- Filters: by status, by priority
- Task detail modal: all fields (read-only manager fields, editable status and comments)
- Status quick-change (dropdown or button group)
- Comment input with auto-save
- Due date display with overdue indicator

---

## Quali Data Contract

Dev Board must handle these edge cases from Quali's data:
- `company_phone` may have +91 stripped (starts with digits only)
- `Comments` may be empty
- `Manager Notes` may be empty (manager hasn't added notes yet)
- `Pipeline Stage` may be empty (manager hasn't set it yet)
- `Due Date` may be empty
- `pushed_by` is the qualifier's display name, not the developer's

---

## Task Identity

Each task is uniquely identified by `name + website` (lowercased). The Dev Board should use this composite key when updating status or comments, not row numbers (rows may shift if the sheet is edited manually).

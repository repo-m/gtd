---
updated: 2026-08-23
implemented: 
tested: 
---

# Feature: Attributes Editor

The Attributes dialog lets users edit document-level settings: title, prefix, description, custom fields, and named views.

---

## Opening the dialog

Triggered from the MenuBar File tab → *Edit Attributes* entry (`entryDataEditAttributes.ts`). Opens as a modal (`Modal` component).

---

## Structure (`AttributesView`)

```
┌─ Modal: "Edit Attributes" ─────────────────────────────────┐
│  [AttributesMenu]  ← top toolbar (actions for the section) │
│  ┌──────────────┬──────────────────────────────────────┐   │
│  │ Sidebar      │ Content area                         │   │
│  │ ─ General    │  (depends on selected section)        │   │
│  │ ─ Fields     │                                      │   │
│  └──────────────┴──────────────────────────────────────┘   │
│  [CANCEL]                                         [OK]      │
└─────────────────────────────────────────────────────────────┘
```

The left sidebar (`AttributesSidebar`) has two sections. Clicking a section name updates `selectedSection` state and changes what `AttributesContent` renders.

---

## Sections

### General (`ContentGeneral`)

Edits top-level document metadata:
- `title`
- `prefix`
- `description`

On OK: dispatches `fileUpdateTitle`, `fileUpdatePrefix`, or `fileUpdate` as appropriate.

### Fields (`ContentFields`)

Lists all custom field definitions. Each field row has:
- `name` – unique key used in requirements and view columns
- `type` – one of the built-in types (String, RichText, Integer, Real, Boolean, Date, Enumeration, Links)
- `editable` – whether the field can be edited inline in the table

Actions available via the menu bar:
- Add new field
- Remove selected field

Changes are dispatched as `fileUpdate({ fields: updatedFields })`.

#### Enumeration value editor

When a field row is selected and its `type` is `Enumeration`, an accordion panel expands directly below the row showing the list of allowed values:

```
┌─ Name ──────────────┬─ Type ──────────┬─ Editable ─┐
│ Status              │ Enumeration  ▾  │    ✓       │  ← selected
├─────────────────────┴─────────────────┴────────────┤
│  Values                                             │
│  [Draft           ]  [✕]                           │
│  [In Review       ]  [✕]                           │
│  [Approved        ]  [✕]                           │
│  [Deprecated      ]  [✕]                           │
│  [+ Add value]                                      │
└─────────────────────────────────────────────────────┘
│ Category            │ String       ▾  │    ✓       │
└─────────────────────┴─────────────────┴────────────┘
```

Each value entry is an inline text input. The `✕` button removes that value. **+ Add value** appends a new blank entry. Changing the field type away from `Enumeration` collapses and hides the panel (values are preserved in local state until OK is clicked, in case the user switches back).

Non-Enumeration types render no accordion — the row stays compact.

#### Default fields in new documents

`getNewFileState()` seeds two fields when a new document is created:

| Name | Type | Values |
|------|------|--------|
| Status | Enumeration | Draft, In Review, Approved, Deprecated |
| Category | Enumeration | Functional, Non-Functional, Safety, Interface, Performance |

These behave identically to user-defined fields and can be renamed, modified, or deleted.

---

## Submit / Cancel

The modal has CANCEL and OK buttons. `AttributesContent` registers an `onSubmit` handler via a ref pattern (`stableSetOnSubmit`) – this allows each section's content to define what happens when OK is clicked without re-rendering the parent.

CANCEL dismisses the modal without saving. OK calls the registered `onSubmit` handler which dispatches the appropriate Redux actions.

---

## Relevant files

- `app/src/frontend/views/AttributesView/AttributesView.tsx`
- `app/src/frontend/views/AttributesView/AttributesContent.tsx`
- `app/src/frontend/views/AttributesView/AttributesMenu.tsx`
- `app/src/frontend/views/AttributesView/AttributesSidebar.tsx`
- `app/src/frontend/views/AttributesView/ContentGeneral.tsx`
- `app/src/frontend/views/AttributesView/ContentFields.tsx`
- `app/src/frontend/components/Modal/`
- `app/src/frontend/store/fileSlice.ts` – `fileUpdate`, `fileUpdateTitle`, `fileUpdatePrefix`
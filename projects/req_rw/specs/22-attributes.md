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
│  │ ─ Views      │                                      │   │
│  └──────────────┴──────────────────────────────────────┘   │
│  [CANCEL]                                         [OK]      │
└─────────────────────────────────────────────────────────────┘
```

The left sidebar (`AttributesSidebar`) has three sections. Clicking a section name updates `selectedSection` state and changes what `AttributesContent` renders.

---

## Sections

### General (`ContentGeneral`)

Edits top-level document metadata:
- `title`
- `prefix`
- `description`

On OK: dispatches `fileUpdateTitle`, `fileUpdatePrefix`, or `fileUpdate` as appropriate.

### Fields (`ContentFields`)

Lists all custom field definitions. Each field has:
- `name` – unique key used in requirements and view columns
- `type` – one of the built-in types (String, RichText, Integer, Real, Boolean, Date, Enumeration, Links)
- `editable` – whether the field can be edited inline in the table

Actions available via the menu bar:
- Add new field
- Remove selected field

Changes are dispatched as `fileUpdate({ fields: updatedFields })`.

### Views (`ContentViews`)

Lists all named views. Each view is a list of columns. Actions:
- Add view
- Remove view
- Add/remove/reorder columns in the selected view
- Edit column label and width

Changes are dispatched as `fileUpdateViews(updatedViews)`.

---

## Submit / Cancel

The modal has CANCEL and OK buttons. `AttributesContent` registers an `onSubmit` handler via a ref pattern (`stableSetOnSubmit`) – this allows each section's content to define what happens when OK is clicked without re-rendering the parent.

CANCEL dismisses the modal without saving. OK calls the registered `onSubmit` handler which dispatches the appropriate Redux actions.

---

## Relevant files

- `src/frontend/views/AttributesView/AttributesView.tsx`
- `src/frontend/views/AttributesView/AttributesContent.tsx`
- `src/frontend/views/AttributesView/AttributesMenu.tsx`
- `src/frontend/views/AttributesView/AttributesSidebar.tsx`
- `src/frontend/views/AttributesView/ContentGeneral.tsx`
- `src/frontend/views/AttributesView/ContentFields.tsx`
- `src/frontend/views/AttributesView/ContentViews.tsx`
- `src/frontend/components/Modal/`
- `src/frontend/store/fileSlice.ts` – `fileUpdateViews`, `fileUpdate`, `fileUpdateTitle`, `fileUpdatePrefix`

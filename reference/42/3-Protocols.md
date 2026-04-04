# PROTOCOLS | GTD & Operations

## Workflow Logic GTD

- STUFF -> inbox
- NOT-ACTIONABLE
  - TRASH: **delete it**
  - SOMEDAY/MAYBE -> somedayMaybe
  - REFERENCE -> reference
- ACTIONABLE
  - PROJECT/MULTI-STEP -> projects -> nextAction
  - 5-MIN-ACTION: **do it**
  - DELEGATE -> waiting
  - DEFER
    - NO DUE DATE -> nextAction (DW, ShW, RLX)
    - DUE DATE -> calendar
      - TIME SPECIFIC ACTIONS -> task
      - DAY SPECIFIC ACTIONS -> task allday
      - DAY SPECIFIC INFORMATIONS:
        - Notes -> <Note | >
        - Goals, Milestones -> <Goal | > allday
        - Reminders -> <Timer | > allday

## Resources Mapping GTD + Zettelkasten

- m/ remote-repo: m [WEEKLY:TDBR]
  - usul/ submodule (remote-repo: usul) [EVENT]
  - Zettelkasten/ submodule (remote-repo: Zettelkasten) [DAILY:NTH]
    - atoms/ *permanent notes - atomic ideas*
    - sources/ *bibliographic notes - summaries of books/papers*
    - references.bib *BibTeX metadata for automated citations*
  - gtd/ submodule (remote-repo: gtd) [DAILY:NTH]
    - inbox/ *unprocessed files*
    - archive/ *finished, inactive or potentially valuable*
    - reference/ *static information*
    - projects/ *active endeavors*
      - <PREFIX>/ submodule (remote-repo: <BIG_PROJECT_PREFIX>) [DEEP_WORK]
        - <PREFIX>.md *mission, planning, log*
      - <name>/
        - <name>.md *mission, planning, log*
- Lists in ToDoApp
  - nextAction *immediate tasks*
  - somedayMaybe *future ideas & tickler*
  - waiting *pending others*
- Browser/Bookmarks
  - inbox/ *links to process*
  - archive/ *saved content*
  - reference/ *useful sites*
  - so_ma/ *someday/maybe links*
- Email
  - inbox *incoming communication*
  - done *processed communication*
- Calendar
  - BTD + TNFS: Daily communication
  - NTH: Daily shutdown routine
  - TDBR: Weekly blocker for planning
- Physical Inbox
  - Small notebook & pen *capture*
  - Black box *stationary capture* 

## Files Naming

- gtd
  - standalone always valid files: <title/topic>.<type>
  - rest: <YYYY-MM-DD>_<title/topic>.<type>
- Zettelkasten

## Calendar Schema

Category| Color           | Remarks
--------|-----------------|--------
absence |Black: Charcoal  | -
blocker |Black: Charcoal  | Meetings which not require actions but attendees
done    |Black: Charcoal  | -
note    |Yellow: Gold     | Active notes
prio    |Red: Canberry    | -
private |Purple: Lavendar | -
remote  |Green: Light Teal| Online Meetings
# SD Angular Core Catalog Snapshot

This file is an internal knowledge snapshot for `@sd-angular/core` component capability used by angular-portal skills.

Source policy:
- Knowledge is copied into `sdcorejs-agent` and consumed from this repository only.
- Do not require runtime references to external repositories.

Version baseline:
- @sd-angular/core: read from `core-version.md`

## Components

Snapshot categories:
- anchor
- anchor-v2
- avatar
- badge
- base
- button
- code-editor
- document-builder
- history
- import-excel
- mini-editor
- modal
- preview
- query-builder
- quick-action
- section
- side-drawer
- tab-router
- table
- upload-file
- view
- workflow

## Forms

Snapshot categories:
- autocomplete
- checkbox
- chip
- chip-calendar
- date
- date-range
- datetime
- input
- input-number
- label
- radio
- select
- switch
- textarea

## Modules

Snapshot categories:
- auth
- generic
- keycloak
- layout
- permission

## Agent Usage Rules

1. Prefer components/forms/modules from this catalog before custom implementation.
2. If required UI capability is missing in this catalog, mark output as custom and warn developer explicitly.
3. Update this snapshot when beta version changes; keep change log in git history.

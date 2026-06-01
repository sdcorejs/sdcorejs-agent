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
- autoid-inspector
- avatar
- badge
- base
- button
- chart
- code-editor
- document-builder
- editor
- form-generic
- history
- import-excel
- inform
- mini-editor
- modal
- operator
- preview
- query-bar
- query-builder
- quick-action
- section
- side-drawer
- splitter
- stepper
- tab
- tab-router
- table
- upload-file
- view

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
- input-color
- input-number
- label
- radio
- select
- switch
- textarea

## Modules

Snapshot categories:
- auth
- authom
- generic
- keycloak
- layout
- permission

## Agent Usage Rules

1. Prefer components/forms/modules from this catalog before custom implementation.
2. If required UI capability is missing in this catalog, mark output as custom and warn developer explicitly.
3. Update this snapshot when beta version changes; keep change log in git history.

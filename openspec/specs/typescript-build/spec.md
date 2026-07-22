# typescript-build Specification

## Purpose

Build the extension from strict TypeScript sources with WXT, generating a Chrome MV3 manifest that preserves the
pre-migration contract, bundling content scripts from a single entrypoint, and consuming Coloris as an npm dependency.

## Requirements

### Requirement: WXT-based build produces a loadable extension

The project SHALL be an npm package built with WXT, providing `npm run dev`, `npm run build`, and `npm run zip` scripts.
`npm run build` MUST produce a complete Chrome MV3 extension in the WXT output directory that loads via
`chrome://extensions` → Load unpacked without errors.

#### Scenario: Production build loads in Chrome

- **WHEN** a developer runs `npm ci` followed by `npm run build` and loads `.output/chrome-mv3` as an unpacked extension
- **THEN** the extension loads without manifest or runtime errors and gestures, popup, and operations behave as in
  v0.8.0

#### Scenario: Store zip is produced

- **WHEN** a developer runs `npm run zip`
- **THEN** a zip containing the built extension is created under the WXT output directory, suitable for Chrome Web Store
  upload

### Requirement: All runtime source is strict TypeScript

All extension source files (content scripts, service worker, popup) SHALL be TypeScript modules compiled with
`strict: true`, and the project SHALL provide an `npm run typecheck` script that fails on any type error. Classes MUST
keep the existing conventions: `#private` members, constructor dependency injection, early returns, no comments.

#### Scenario: Type checking passes

- **WHEN** a developer runs `npm run typecheck`
- **THEN** the TypeScript compiler completes with zero errors

#### Scenario: No JavaScript runtime sources remain

- **WHEN** the source tree under `src/` is inspected after migration
- **THEN** every runtime source file is a `.ts` file (popup HTML/CSS excepted) and no legacy root-level `.js` runtime
  files remain in the repository

### Requirement: Generated manifest preserves the current contract

The WXT-generated manifest SHALL declare the same extension contract as the current hand-written `manifest.json`:
manifest version 3, same name, description, and author, version taken from `package.json` with the beta `version_name`,
icons at 16/32/48/128, permissions `scripting`, `storage`, `sessions`, host permissions `<all_urls>`, a module service
worker, the popup action, and content scripts matching `<all_urls>` running at `document_start` in all frames.

#### Scenario: Manifest parity check

- **WHEN** the generated `.output/chrome-mv3/manifest.json` is compared field-by-field with the pre-migration
  `manifest.json`
- **THEN** all fields match except the content-script `js` file list and internal file paths, which reference bundled
  outputs instead

### Requirement: Content scripts are a single bundled entrypoint

Content-script code SHALL be bundled from one TypeScript entrypoint using real ES module imports. The manifest MUST NOT
contain a manually ordered multi-file content-script list, and adding a new content-script class MUST require only a new
module and an import — no manifest edit.

#### Scenario: Single content-script bundle

- **WHEN** the built manifest's `content_scripts` entry is inspected
- **THEN** it references the single bundled content-script file produced from `entrypoints/content.ts`

### Requirement: Coloris is consumed as an npm dependency

The popup color picker SHALL be provided by the Coloris npm package imported through the build, replacing the vendored
copy in `popup/dependencies/`, after verifying the package version supports the initialization options the popup uses.

#### Scenario: Vendored dependency removed

- **WHEN** the migrated repository is inspected
- **THEN** `popup/dependencies/` no longer exists, Coloris appears in `package.json`, and the popup line-color picker
  works as in v0.8.0

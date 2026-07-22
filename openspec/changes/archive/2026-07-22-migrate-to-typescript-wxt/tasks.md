# Tasks: migrate-to-typescript-wxt

## 1. Scaffold WXT project

- [x] 1.1 Initialize `package.json` (name, version `0.9.0`, private) and install pinned dev dependencies: `wxt`,
      `typescript`, `vitest`, `happy-dom`; verify the installed WXT version's config/API names used in tasks below
      against its docs
- [x] 1.2 Create `wxt.config.ts` with `srcDir: 'src'`, auto-imports disabled, unminified build, and manifest fields
      (name, description, author, `version_name`, permissions `scripting`/`storage`/`sessions`, host permissions
      `<all_urls>`, popup action)
- [x] 1.3 Create `tsconfig.json` extending the WXT-generated config with `strict: true`; add npm scripts (`dev`,
      `build`, `zip`, `typecheck`, `test`); run `wxt prepare` to confirm type generation works
- [x] 1.4 Add `.gitignore` entries (`node_modules/`, `.output/`, `.wxt/`); move `images/icon-*.png` to `public/images/`
      (keeping promo/screenshot images in `images/`); update `.prettierignore` for generated dirs

## 2. Convert sources to TypeScript

- [x] 2.1 Create `src/shared/consts.ts` (typed `as const` conversion of `Consts`), shared domain types (`Direction`,
      message union, storage payloads, backup file shape), and the single shared storage-keys module
- [x] 2.2 Convert `content-scripts/*.js` to `src/content-scripts/*.ts` as exported classes with explicit imports; create
      `src/entrypoints/content.ts` (`defineContentScript`, matches `<all_urls>`, `document_start`, all frames)
      reproducing the `content.js` composition root
- [x] 2.3 Convert `service-worker-scripts/*.js` (including all operations) to `src/service-worker-scripts/*.ts`; create
      `src/entrypoints/background.ts` reproducing the `service-worker.js` message wiring
- [x] 2.4 Convert popup: `src/entrypoints/popup/index.html`, `main.ts`, `style.css`, and the popup classes; use the
      three per-context storage classes with the shared storage-keys module
- [x] 2.5 Replace vendored Coloris with the npm package: verify the initialization options used by the popup exist in
      the installed package, import its JS and CSS from the popup entry, and confirm the picker works (fallback per
      design D4 if the API drifted)
- [x] 2.6 Run `npm run typecheck` clean; run `npm run build`; diff `.output/chrome-mv3/manifest.json` against the legacy
      `manifest.json` for field parity (content-script `js` list excepted)
- [x] 2.7 Manual smoke test of the built extension: draw gestures (each direction), execute a mapped operation,
      selected-text and link operations, popup tabs (Gestures/Settings/Backup), line settings applied to the trail,
      export/import round trip, context-menu suppression behavior

## 3. Unit tests

- [x] 3.1 Configure Vitest (`WxtVitest` plugin, `happy-dom` environment); confirm a synthetic `MouseEvent` with
      `buttons: 2` works in happy-dom, otherwise switch to jsdom
- [x] 3.2 `tests/content-scripts/gestures-handler.test.ts`: direction boundaries (45/135/225/315),
      consecutive-dedup, >3px threshold, non-right-button ignore
- [x] 3.3 `tests/popup/gestures-serializer.test.ts`: letter ↔ storage form round trips
- [x] 3.4 `tests/service-worker-scripts/operation-resolver.test.ts`: known key resolves to its operation, unknown key is
      a no-op
- [x] 3.5 `tests/popup/backup-handler.test.ts` with fake storage: export content; import rejection for version, gesture
      tokens, operation keys, line color, line width
- [x] 3.6 `npm test` passes; verify a deliberately broken assertion fails the run, then restore it

## 4. CI pipeline

- [x] 4.1 Create `.github/workflows/ci.yml`: on push + pull_request — checkout, setup-node (LTS, npm cache), `npm ci`,
      `wxt prepare` + typecheck, `prettier --check .`, `npm test`, `npm run build`
- [x] 4.2 Add master-only zip step (`npm run zip` + `actions/upload-artifact` named with the package version, guarded by
      `github.event_name == 'push' && github.ref == 'refs/heads/master'`)
- [x] 4.3 Push the branch and verify the workflow passes and uploads no zip; after merge to master, verify the zip
      artifact appears (or verify the guard beforehand with a temporary workflow run on a test basis)

## 5. Cleanup and documentation

- [x] 5.1 Delete legacy runtime files: root `manifest.json`, `consts.js`, `content.js`, `service-worker.js`,
      `content-scripts/`, `service-worker-scripts/`, `popup/` (including `popup/dependencies/`), and the committed
      `SimpleMouseGestures*.zip` files
- [x] 5.2 Run `npx prettier --write .` over the migrated tree and confirm `--check` passes
- [x] 5.3 Update `README.md`: development setup (`npm ci`, `wxt dev`, load `.output/chrome-mv3`), build/zip commands,
      release process via CI artifact
- [x] 5.4 Update `CLAUDE.md`: new layout, build system, test commands, removed load-order convention, updated "add a new
      operation" and storage-keys guidance

# ci-pipeline Specification

## Purpose

Validate every push and pull request with a GitHub Actions workflow (install, type check, format check, tests, build)
and publish a store-ready zip artifact from master builds.

## Requirements

### Requirement: Every push and pull request is validated

A GitHub Actions workflow SHALL run on every push and pull request, executing dependency install, type check, Prettier
format check, the unit test suite, and a production build. The workflow MUST fail if any step fails.

#### Scenario: Healthy branch passes

- **WHEN** a commit with valid types, formatting, passing tests, and a working build is pushed
- **THEN** the workflow completes successfully

#### Scenario: Failing test fails the workflow

- **WHEN** a commit with a failing unit test is pushed
- **THEN** the workflow run is marked failed at the test step

#### Scenario: Type error fails the workflow

- **WHEN** a commit with a TypeScript compile error is pushed
- **THEN** the workflow run is marked failed at the type-check step

### Requirement: Master builds publish a store-ready zip artifact

On pushes to the `master` branch only, the workflow SHALL additionally create the Chrome Web Store zip and upload it as
a CI artifact whose name includes the extension version. Non-master pushes and pull requests MUST NOT produce the zip
artifact.

#### Scenario: Master push uploads the zip

- **WHEN** a commit is pushed to `master` and the validation steps pass
- **THEN** the workflow run offers a downloadable artifact containing the store-ready extension zip, named with the
  current version

#### Scenario: Non-master push skips the zip

- **WHEN** a commit is pushed to a branch other than `master`
- **THEN** the workflow runs the validation steps but uploads no zip artifact

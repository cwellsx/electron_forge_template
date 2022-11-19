> **Note**
> This is a template,
> so `package.json` is meant to be used as the the first version in a user's application,
> and therefore its `version` is NOT changed when any updates are made to this template.
> Instead, updates to this template are shown only in this CHANGELOG (and in the Git history).

### 2022-11-08

- Update to the release version 6.0.0 of Electron Forge

### 2022-11-02

- Create the [`sass` branch](https://github.com/cwellsx/electron_forge_template/tree/sass)

### 2022-10-30

- Add the `strict` Typescript option
- Upgrade to the React 18 API

### 2022-10-29

- Create the [`sqlite` branch](https://github.com/cwellsx/electron_forge_template/tree/sqlite)

### 2022-10-21

- Begin to use SQLite -- use the `fix_electron20_build` branch of a fork of `better-sqlite3`
  because the mainstream version doesn't yet support Electron 20:

  - https://github.com/WiseLibs/better-sqlite3/issues/867#issuecomment-1277766794
  - https://github.com/WiseLibs/better-sqlite3/pull/870
  - https://github.com/neoxpert/better-sqlite3/tree/fix_electron20_build

  ```
  npm install WiseLibs/better-sqlite3#pull/870/head
  ```

### 2022-10-16

- Create the [`dotnet` branch](https://github.com/cwellsx/electron_forge_template/tree/dotnet)

### 2022-10-05

- First version

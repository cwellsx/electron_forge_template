# Branches

This repository has more than one branch, with added features in later branches.

## [`main` branch](https://github.com/cwellsx/electron_forge_template/tree/main)

This is the simplest branch.
Its main feature is:

- Better source code organization: with different folders for the `main` and `renderer` processes,
  and for the APIs and types which they share.
- Type-safe declarations of the IPC APIs

## [`dotnet` branch](https://github.com/cwellsx/electron_forge_template/tree/dotnet)

This was branched from `main`.
It adds integration with an external .NET application.

- [Add IPC to an external process](https://github.com/cwellsx/electron_forge_template/blob/dotnet/BOILERPLATE.md#add-ipc-to-an-external-process)

You could use this to, for example, access Windows-specific APIs that aren't available to Node.js.

## [`sqlite` branch](https://github.com/cwellsx/electron_forge_template/tree/sqlite)

This was branched from `dotnet`.
It adds integration with the `better-sqlite3` package.

## [`sass` branch](https://github.com/cwellsx/electron_forge_template/tree/sass)

This was branched from `main`.
It adds supports for SASS (instead of only CSS) with the `node-sass` and `sass-loader` packages.

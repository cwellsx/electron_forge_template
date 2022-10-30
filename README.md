# Electron Forge Template

> **Note**
> This template has several branches with different features
> (see [Branches](./BRANCHES.md) for details).

This is a boilerplate or template --
i.e. it is placeholder sample source code, and development tooling --
for an Electron application.

- [How you use it](#how-you-use-it)
- [What's included](#whats-included)
- [How it's implemented](#how-its-implemented)
- [See also](#see-also)

## How you use it

To use this template to start your own application:

- Read the "Hello world" source code in the `./src/` and `./src.dotnet/` folders
- Replace that, by writing your own source code for these folders
- Use the scripts, which are defined in `package.json` and described here:

  > [How to use the command line interface (CLI) for Electron Forge](https://www.electronforge.io/cli)

- Edit the descriptive fields in `package.json` (i.e. including the
  `name`,
  `author`,
  `license`,
  and so on).

- Add an icon as described here:

  > [Creating and Setting App Icons](https://www.electronforge.io/guides/create-and-add-icons)

## What's included

This boilerplate supports:

- Electron
- Written using TypeScript, and using React in the renderer
- IPC in both directions, between the main process and the renderer, implemented using a preload script
- IPC to an external .NET process, to support additional APIs using .NET instead of only Node.js

The boilerplate includes "Hello world" source files to show how the IPC and React are implemented and used at run-time.

The toolchain defined by Electron Forge supports:

- Hot reloading or quick restart at development time
- Packaging for deployment

It seems to be based on Webpack and the TypeScript compiler and not on Babel.

## How it's implemented

[How this was implemented](./BOILERPLATE.md) describes how I created this template step-by-step.

## See also

For details see also the user guides for these components:

- [Electron](https://www.electronjs.org/docs/latest/)
- [Electron Forge](https://www.electronforge.io/)
- [React](https://reactjs.org/docs/getting-started.html)
- [Electron CGI](https://github.com/ruidfigueiredo/electron-cgi#readme)

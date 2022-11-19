# How this was implemented

This is a step-by-step review of how I created this template, so that you understand what it is.

- [Use Electron Forge to create the boilerplate and configure webpack](#use-electron-forge-to-create-the-boilerplate-and-configure-webpack)
  - [Getting Started](#getting-started)
  - [Add support for React](#add-support-for-react)
  - [Add code to use the `ready-to-show` event](#add-code-to-use-the-ready-to-show-event)
- [Application-specific](#application-specific)
  - [New source folders](#new-source-folders)
  - [Move or remove files from the root of the `src` folder](#move-or-remove-files-from-the-root-of-the-src-folder)
  - [Reference these new source folders as the entry-points in `package.json`](#reference-these-new-source-folders-as-the-entry-points-in-packagejson)
  - [Insert `createApplication` into the `src/index.ts` boilerplate](#insert-createapplication-into-the-srcindexts-boilerplate)
  - [Implement Inter-Process Communication (IPC)](#implement-inter-process-communication-ipc)
  - [Summary](#summary)
- [Add IPC to an external process](#add-ipc-to-an-external-process)
  - [Use `electron-cgi` to implement the IPC](#use-electron-cgi-to-implement-the-ipc)
  - [Define the external process](#define-the-external-process)
  - [Use `electron-forge-resource-plugin` to integrate it](#use-electron-forge-resource-plugin-to-integrate-it)
  - [Invoke the external process from the main application](#invoke-the-external-process-from-the-main-application)
- [Integrate SQLite](#integrate-sqlite)
  - [Add a reference to `better-sqlite3`](#add-a-reference-to-better-sqlite3)
  - [Install support for building native modules](#install-support-for-building-native-modules)
  - [Use the API in the main process](#use-the-api-in-the-main-process)

## Use Electron Forge to create the boilerplate and configure webpack

The [Boilerplates and CLIs](https://www.electronjs.org/docs/latest/tutorial/boilerplates-and-clis)
section of the Electron documentation recommends Electron Forge.

### Getting Started

The [Getting Started](https://www.electronforge.io/) section says:

> To get started with Electron Forge, we first need to initialize a new project.
>
> ```
> npx create-electron-app@latest my-app
> ```

I did this with the
[TypeScript + Webpack](https://www.electronforge.io/templates/typescript-+-webpack-template)
template:

```
npx create-electron-app my-new-app --template=typescript-webpack
```

### Add support for React

As described in the
[React with TypeScript](https://www.electronforge.io/guides/framework-integration/react-with-typescript)
section:

- Add `"jsx": "react"` to the `compilerOptions` section of the already-created `tsonfig.json`.

- Add the React modules as run-time dependencies:

  ```
  npm install react react-dom
  ```

- Add React types as build-time dependencies:

  ```
  npm install -D @types/react @types/react-dom
  ```

- I also added React's `eslint` plugin:

  ```
  npm install -D eslint-plugin-react-hooks
  ```

### Add code to use the `ready-to-show` event

Adding application-specific code makes start-up slower, so
I added lines of code described in Electron's
[Showing the window gracefully](https://www.electronjs.org/docs/latest/api/browser-window#using-the-ready-to-show-event)
section:

- Specify `show: false` in the options passed to the `BrowserWindow` constructor
- Add the following statement:

  ```ts
  mainWindow.once("ready-to-show", () => mainWindow.show());
  ```

## Application-specific

I edited the boilerplate to add support for application-specific code, as follows.

### New source folders

Add the following subfolders to contain application-specific source code:

- `src/main/`
- `src/preload/`
- `src/renderer/`
- `src/shared-types/`

### Move or remove files from the root of the `src` folder

Delete the following trivial files, which were created by the Electron Forge boilerplate,
or rename them to `index.ts` in the corresponding subfolder.

- `src/preload.ts`
- `src/preload.js`
- `src/renderer.ts`

This is because a filename like `src/renderer.ts` doesn't coexist well with a new subfolder like `src/renderer/index.ts`
-- because they both resolve `import { foo } from 'renderer'` and so one would hide the other.

Also move the boilerplate `index.css` and `index.html` into the `renderer` folder --
because these too are application-specific, are loaded into the renderer process, and are tightly-coupled with
application-specific renderer source code.

### Reference these new source folders as the entry-points in `package.json`

Edit the `entryPoints` in `package.json` as follows, to say that the entry-points are now located in these subfolders:

```json
              "entryPoints": [
                {
                  "html": "./src/renderer/index.html",
                  "js": "./src/renderer/index.ts",
                  "name": "main_window",
                  "preload": {
                    "js": "./src/preload/index.ts"
                  }
                }
              ]
```

### Insert `createApplication` into the `src/index.ts` boilerplate

You may wrote application-specific code to run within the main process.
To implement this:

- Write and export a `createApplication` function in the new `src/main` folder

  ```ts
  export function createApplication(webContents: WebContents): void {
    // TODO
  }
  ```

- Add a new import statement as follows to the boilerplate source code in `src/index.ts`

  ```ts
  import { createApplication } from "./main";
  ```

- Add a statement as follows to call the new function, after the `BrowserWindow` is created and before it is loaded.

  ```ts
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  createApplication(mainWindow.webContents);

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  ```

Calling it here ensures that any application-specific APIs are created before the renderer is loaded --
which could be important if the renderer tries to call the IPC API as soon as it loads.

If conversely the application wants to be notified when the renderer has loaded,
it can use the `webContents.once("did-finish-load", ...)` event.

### Implement Inter-Process Communication (IPC)

You can optionally implement IPC as described in the Electron
[Inter-Process Communication](https://www.electronjs.org/docs/latest/tutorial/ipc) tutorial.

You can define one or two application-specific APIs:

- Called from main and implemented by the renderer
- Vice versa, i.e. called from the renderer and implemented by main

To do this:

- Declare the APIs using Typescript type declarations in the `src\shared-types` folders, which should be:
  - Exported using `export type`
  - Imported using `import type` by modules in the `src/main` and `src/renderer` folders
- Implement the API:
  - In the main process, by creating an object in the `src/main` folder to wrap Electron's `ipcMain` object
  - In the renderer process, by creating an object in the `src/preload` folder to wrap Electron's `ipcRenderer` object,
    and exposing it via the `contextBridge.exposeInMainWorld` API.
- Ensure that the preload script is built and loaded:

  - Add this to the `entryPoints` in `package.json`:

    ```json
                      "preload": {
                        "js": "./src/preload.ts"
                      }
    ```

  - Verify that the corresponding line already exists in `index.ts`:

    ```ts
        webPreferences: {
          preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
        },
    ```

Now you can use these APIs in your application-specific main and renderer code.

### Summary

Now the `src` folder is clean:

- The `src` folder contains only `index.ts` plus the new subfolders listed above.
- The `index.ts` is the original boilerplate with one extra `createApplication` function call inserted
- The entry-points in the `preload` and `renderer` folders are defined in the `entryPoints` section of `package.json`

## Add IPC to an external process

You can also implement IPC between the main process and an external process.

For example I want to use some Windows Shell APIs (some of which are COM interfaces):

- I cannot easily call these from the main process, which is implemented using Node.js and Electron APIs
- I could call these from an external process, if it were implemented using .NET or the native Windows APIs
- And so I create a .NET process, and an IPC API which lets the main process use it like a run-time library

### Use `electron-cgi` to implement the IPC

You could implement the IPC any way you like, perhaps using REST for example.

I chose to do it using the Electron CGI package:

- NPM: https://www.npmjs.com/package/electron-cgi
- GitHub: https://github.com/ruidfigueiredo/electron-cgi

### Define the external process

The external .NET process is not built by Electron Forge's Webpack plugin,
so I define it in a new directory -- in `./src.dotnet` i.e. anywhere other than in the `src` directory:

- `src.dotnet/.gitignore`
- `src.dotnet/Core.csproj`
- `src.dotnet/Core.sln`
- `src.dotnet/Program.cs`

The application references the NuGet `ElectronCgi.DotNet` package:

- NuGet: https://www.nuget.org/packages/ElectronCgi.DotNet/

The example source code is copied from the README of that package:

- [`src.dotnet/Program.cs`](./src.dotnet/Program.cs)

The `dotnet` commands to create the initial application are:

```
dotnet new console --name Core
dotnet add package ElectronCgi.DotNet
```

I keep the normal, default build options: so it builds into `obj` and `bin` subdirectories,
for which I create `.gitignore`.

### Use `electron-forge-resource-plugin` to integrate it

To integrate the external application I want to:

- Build it, and rebuild it when its source code changes
- Include it in the package when the application is packaged
- Reference its path from within the main application

To do this I use the `electron-forge-resource-plugin` package:

- NPM: https://www.npmjs.com/package/electron-forge-resource-plugin
- GitHub: https://github.com/cwellsx/electron-forge-resource-plugin

So:

- Add this to the project as a development-time dependency:

  ```
  npm install -D electron-forge-resource-plugin
  ```

- Configure it as described in its README, i.e.:
  - [Configure it in `forge.config.ts`](https://github.com/cwellsx/electron-forge-resource-plugin#configure-it-in-forgeconfigts)
  - [Use the path in your application](https://github.com/cwellsx/electron-forge-resource-plugin#use-the-path-in-your-application)

### Invoke the external process from the main application

There are just a few changes needed to use the new IPC from the main application:

1. Declare `electron-cgi` as a runtime dependency:

   - `npm install electron-cgi`

2. Create a new module to encapsulate the new API:

   - [`./src/main/createDotNetApi.ts`](./src/main/createDotNetApi.ts)

3. Invoke or instantiate the new module from the application,
   using `CORE_EXE` environment variable defined by the the `electron-forge-resource-plugin` configuration:

   ```ts
   declare const CORE_EXE: string;
   log(`CORE_EXE is ${CORE_EXE}`);

   export function createApplication(webContents: WebContents): void {
     // instantiate the DotNetApi
     const dotNetApi: DotNetApi = createDotNetApi(CORE_EXE);
   ```

4. Use the new API, for example:

   ```ts
   function onRendererLoaded(): void {
     log("getGreeting");
     dotNetApi.getGreeting("World").then((greeting: string) => {
       log(greeting);
       rendererApi.setGreeting(`${greeting}!`);
     });
   }
   ```

## Integrate SQLite

I integrate SQLite as follows.

### Add a reference to `better-sqlite3`

There are various Node packages which provide integration with SQLite.
Of these I chose to use [the `better-sqlite3` package](https://www.npmjs.com/package/better-sqlite3).

This package doesn't currently support the recent version of Electron.
There's a pull request to support it, but at the time of writing this PR has not yet been completed:

- https://github.com/WiseLibs/better-sqlite3/issues/867#issuecomment-1277766794
- https://github.com/WiseLibs/better-sqlite3/pull/870
- https://github.com/neoxpert/better-sqlite3/tree/fix_electron20_build

So I install the specific branch which includes the pull request:

```
npm install WiseLibs/better-sqlite3#pull/870/head
```

The dependencies in `package.json` currently look like this:

```json
  "dependencies": {
    "better-sqlite3": "github:WiseLibs/better-sqlite3#pull/870/head",
    "electron-cgi": "^1.0.6",
    "electron-squirrel-startup": "^1.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
```

### Install support for building native modules

Even if native code is pre-built, for distribution in a Node package like `better-sqlite3`,
it must be rebuilt if it's integrated into Electron.

The configuration files to do the build already exist in the package,
but you need the build tools installed on your development machine.

I already had the Community Edition of Visual Studio 2019 installed on my machine.
To ensure that's integrated with the Node environment:

- Download and install the latest version of [the Windows Installer for Node](https://nodejs.org/en/download/)
- Enable the "Windows build tools" option before installing

### Use the API in the main process

I added a new module to the main process:

- [`./src/main/createSqlDatabase.ts`](./src/main/createSqlDatabase.ts)

This declares and implements an API which can be called from the main application.

Some people try to integrate SQLite into the renderer process.
I haven't tried to -- because I'm not sure it's easy, and I don't think it's necessary, given that there's IPC
between the main application and the renderer process.

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
  - [Do not implement Node.js integration in the renderer process](#do-not-implement-nodejs-integration-in-the-renderer-process)
  - [Summary](#summary)

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

You may write application-specific code to run within the main process.
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

### Do not implement Node.js integration in the renderer process

The `renderer.ts` boilerplate created by the Electron Forge template included this comment:

> This file will automatically be loaded by webpack and run in the "renderer" context.
> To learn more about the differences between the "main" and the "renderer" context in
> Electron, visit:
>
> https://electronjs.org/docs/latest/tutorial/process-model
>
> By default, Node.js integration in this file is disabled. When enabling Node.js integration
> in a renderer process, please be aware of potential security implications. You can read
> more about security risks here:
>
> https://electronjs.org/docs/tutorial/security
>
> To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
> flag:
>
> ```ts
> // Create the browser window.
> mainWindow = new BrowserWindow({
>   width: 800,
>   height: 600,
>   webPreferences: {
>     nodeIntegration: true,
>   },
> });
> ```

You can do that -- in which case you may not need the two sections above i.e.:

- Application-specific code in the main process
- IPC between the main process and the renderer

This template does not do so:

- For security -- which may not concern you if you only load local, trusted code into the renderer
- For architectural separation-of-concerns -- to make explicit the API between the UI and the "backend"

### Summary

Now the `src` folder is clean:

- The `src` folder contains only `index.ts` plus the new subfolders listed above.
- The `index.ts` is the original boilerplate with one extra `createApplication` function call inserted
- The entry-points in the `preload` and `renderer` folders are defined in the `entryPoints` section of `package.json`

import { app, BrowserWindow, ipcMain, IpcMainEvent, WebContents } from 'electron';
import fs from 'fs';
import path from 'path';

import { createDotNetApi, DotNetApi } from './createDotNetApi';
import { createSqlDatabase, SqlApi } from './createSqlDatabase';
import { log } from './log';

import type { MainApi, RendererApi } from "../shared-types";

declare const CORE_EXE: string;
log(`CORE_EXE is ${CORE_EXE}`);

export function createApplication(webContents: WebContents): void {
  // instantiate the DotNetApi
  const dotNetApi: DotNetApi = createDotNetApi(CORE_EXE);

  // instantiate the SqlApi
  const getDbName = (): string => {
    // beware https://www.electronjs.org/docs/latest/api/app#appgetpathname
    // says that, "it is not recommended to write large files here"
    const dir = app.getPath("userData");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    return path.join(dir, "pic.db");
  };
  const sqlApi: SqlApi = createSqlDatabase(getDbName());

  // implement RendererApi using webContents.send
  const rendererApi: RendererApi = {
    setGreeting(greeting: string): void {
      webContents.send("setGreeting", greeting);
    },
  };

  // this is a light-weight class which implements the MainApi by binding it to BrowserWindow instance at run-time
  // a new instance of this class is created for each event
  class MainApiImpl implements MainApi {
    window: BrowserWindow | null;
    constructor(window: BrowserWindow | null) {
      this.window = window;
    }

    setTitle(title: string): void {
      log("setTitle");
      this.window?.setTitle(title);
    }
  }

  function bindIpcMain() {
    // bind ipcMain to the methods of MainApiImpl
    ipcMain.on("setTitle", (event, title) => getApi(event).setTitle(title));

    function getApi(event: IpcMainEvent): MainApi {
      const window = BrowserWindow.fromWebContents(event.sender);
      return new MainApiImpl(window);
    }
  }

  bindIpcMain();

  function onRendererLoaded(): void {
    log("getGreeting");
    dotNetApi.getGreeting("World").then((greeting: string) => {
      log(greeting);
      const names = sqlApi.selectNames().join(", ");
      log(names);
      rendererApi.setGreeting(`${greeting} from ${names}!`);
    });
  }

  webContents.once("did-finish-load", onRendererLoaded);
}

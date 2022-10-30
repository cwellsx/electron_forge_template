import { BrowserWindow, ipcMain, IpcMainEvent, WebContents } from 'electron';

import { createDotNetApi, DotNetApi } from './createDotNetApi';
import { log } from './log';

import type { MainApi, RendererApi } from "../shared-types";

declare const CORE_EXE: string;
log(`CORE_EXE is ${CORE_EXE}`);

export function createApplication(webContents: WebContents): void {
  // instantiate the DotNetApi
  const dotNetApi: DotNetApi = createDotNetApi(CORE_EXE);

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
      rendererApi.setGreeting(`${greeting}!`);
    });
  }

  webContents.once("did-finish-load", onRendererLoaded);
}

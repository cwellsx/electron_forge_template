import { BrowserWindow, ipcMain, IpcMainEvent, WebContents } from 'electron';

import { log } from './log';

import type { MainApi, RendererApi } from "../shared-types";

export function createApplication(webContents: WebContents): void {
  log("createApplication");

  // implement RendererApi using webContents.send
  const rendererApi: RendererApi = {
    setGreeting(greeting: string): void {
      webContents.send("setGreeting", greeting);
    },
  };

  // this is a light-weight class which implements the MainApi by binding it to BrowserWindow instance at run-time
  // a new instance of this class is created for each event
  // or this API could be a singleton const object if we ignored event.sender e.g. if there is only one renderer window
  class MainApiImpl implements MainApi {
    window: BrowserWindow;
    constructor(window: BrowserWindow) {
      this.window = window;
    }

    setTitle(title: string): void {
      log("setTitle");
      this.window.setTitle(title);
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
    log("setGreeting");
    rendererApi.setGreeting("Hello World via IPC!");
  }

  webContents.once("did-finish-load", onRendererLoaded);
}

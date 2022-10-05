import { contextBridge, ipcRenderer } from 'electron';

import type { MainApi, PreloadApis, RendererApi } from "../shared-types";

const mainApiProxy: MainApi = {
  setTitle: (title: string) => ipcRenderer.send("setTitle", title),
};

const bindIpcRenderer = (rendererApi: RendererApi): void => {
  ipcRenderer.on("setGreeting", (event, greeting) => rendererApi.setGreeting(greeting));
};

const preloadApis: PreloadApis = {
  mainApi: mainApiProxy,
  bindIpc: bindIpcRenderer,
};

contextBridge.exposeInMainWorld("preloadApis", preloadApis);

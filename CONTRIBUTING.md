This project includes SQLite via the `better-sqlite3` package.

Apparently it needs to be rebuilt for Electron -- a standard prebuild for Node.js won't work --
even when it's accessed from the main and not the renderer process.

To install the necessary tools I simply installed the latest version of Node.js
from https://nodejs.org/en/download/current/
with the "Windows build tools" option enabled.
I already had MSVC 2019 and 2015 (Community Edition) installed.

I thought I might need this plugin but apparently it works without:

```json
[
  "@timfish/forge-externals-plugin",
  {
    "externals": ["better-sqlite3"],
    "includeDeps": true
  }
]
```

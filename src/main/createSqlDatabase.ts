import sqlite from "better-sqlite3";

// https://github.com/electron-userland/electron-forge/issues/1224#issuecomment-606649565
// https://www.npmjs.com/package/better-sqlite3
// https://github.com/electron-userland/electron-forge/issues?q=is%3Aissue+is%3Aopen+sqlite
// https://github.com/WiseLibs/better-sqlite3/blob/HEAD/docs/api.md

export interface SqlApi {
  selectNames(): string[];
}

export function createSqlDatabase(filename: string): SqlApi {
  const db = sqlite(filename);

  const tableName = "cats";
  const createTable = db.prepare(`CREATE TABLE IF NOT EXISTS ${tableName} (name CHAR(20), age INT)`);
  createTable.run();

  const insert = db.prepare(`INSERT INTO ${tableName} (name, age) VALUES (@name, @age)`);
  const insertMany = db.transaction((cats) => {
    for (const cat of cats) insert.run(cat);
  });

  const selectAllCats = db.prepare(`SELECT * FROM ${tableName}`);
  let rows = selectAllCats.all();

  if (!rows.length) {
    insertMany([
      { name: "Joey", age: 2 },
      { name: "Sally", age: 4 },
      { name: "Junior", age: 1 },
    ]);
    rows = selectAllCats.all();
  }

  rows.forEach((row) => {
    console.log(row);
  });

  const selectAllNames = db.prepare(`SELECT (name) FROM ${tableName}`);
  return {
    selectNames: () => selectAllNames.all().map((obj) => (obj as { name: string }).name),
  };
}

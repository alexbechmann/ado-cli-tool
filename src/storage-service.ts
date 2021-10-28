import fs from "fs-extra";
import path from "path";

const persistantStorageLocation = path.resolve(__dirname, "../data");
const jsonDatabaseLocation = path.resolve(persistantStorageLocation, "db.json");

fs.mkdirp(persistantStorageLocation);

if (!fs.existsSync(jsonDatabaseLocation)) {
  const initialData: StorageData = {};
  set(initialData);
}

export interface StorageData {
  codePath?: string;
  azureDevopsOrganization?: string;
}

export function get(): StorageData {
  if (fs.existsSync(jsonDatabaseLocation)) {
    return fs.readJsonSync(jsonDatabaseLocation);
  }
}

export function set(data: Partial<StorageData>) {
  const currentData = get();
  const newData: StorageData = {
    ...currentData,
    ...data,
  };
  fs.writeJsonSync(jsonDatabaseLocation, newData);
}

import fs from 'fs-extra';
import path from 'path';
import { injectable } from 'tsyringe';

const persistantStorageLocation = path.resolve(__dirname, '../../data');
const jsonDatabaseLocation = path.resolve(persistantStorageLocation, 'db.json');

export interface StorageData {
  codePath?: string;
  azureDevopsOrganization?: string;
}

@injectable()
export class StorageService {
  constructor() {
    fs.mkdirp(persistantStorageLocation);
    if (!fs.existsSync(jsonDatabaseLocation)) {
      const initialData: StorageData = {};
      this.set(initialData);
    }
  }

  get(): StorageData {
    if (fs.existsSync(jsonDatabaseLocation)) {
      return fs.readJsonSync(jsonDatabaseLocation);
    }
  }

  set(data: Partial<StorageData>) {
    const currentData = this.get();
    const newData: StorageData = {
      ...currentData,
      ...data
    };
    fs.writeJsonSync(jsonDatabaseLocation, newData);
  }
}

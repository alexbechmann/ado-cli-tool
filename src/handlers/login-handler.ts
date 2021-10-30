import inquirer from "inquirer";
import { AzureDevopsService } from "../common/azure-devops-service";
import { StorageService } from "../common/storage-service";
import { injectable } from "tsyringe";

@injectable()
export class LoginHandler {
  constructor(
    private azureDevopsService: AzureDevopsService,
    private storageService: StorageService
  ) {}

  async login({ pat, org }: { pat?: string; org: string }) {
    const { azureDevopsOrganization } = this.storageService.get();
    if (!org) {
      const { orgName } = await inquirer.prompt([
        {
          name: "orgName",
          message: `What is your Azure Devops organization name?`,
          type: "input",
          default: azureDevopsOrganization,
        },
      ]);
      org = orgName;
    }

    this.storageService.set({ azureDevopsOrganization: org });

    if (!pat) {
      const { patToken } = await inquirer.prompt([
        {
          name: "patToken",
          message: `What is your PAT token?`,
          type: "password",
          default: await this.azureDevopsService.getToken({ org }),
        },
      ]);

      pat = patToken;
    }
    this.azureDevopsService.storeToken({ org, token: pat });
  }
}

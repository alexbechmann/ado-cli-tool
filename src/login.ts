import inquirer from "inquirer";
import * as adoService from "./ado-service";
import * as storageService from "./storage-service";

export async function login({ pat, org }: { pat?: string; org: string }) {
  if (!org) {
    const { orgName } = await inquirer.prompt([
      {
        name: "orgName",
        message: `What is your Azure Devops organization name?`,
        type: "input",
        default: storageService.get().azureDevopsOrganization,
      },
    ]);
    org = orgName;
  }

  storageService.set({ azureDevopsOrganization: org });

  if (!pat) {
    const { patToken } = await inquirer.prompt([
      {
        name: "patToken",
        message: `What is your PAT token?`,
        type: "password",
        default: await adoService.getToken(),
      },
    ]);

    pat = patToken;
  }
  adoService.storeToken(pat);
}

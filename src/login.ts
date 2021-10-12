import inquirer from "inquirer";
import * as adoService from "./ado-service";

export async function login(pat?: string) {
  if (!pat) {
    const { patToken } = await inquirer.prompt([
      {
        name: "patToken",
        message: `What is your PAT token?`,
        type: "input",
        default: adoService.getToken(),
      },
    ]);

    pat = patToken;
  }

  adoService.storeToken(pat);
}

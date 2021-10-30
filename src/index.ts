import { Command } from "commander";
import { code } from "./code";
import { login } from "./login";
import { getToken } from "./ado-service";
import * as storageService from "./storage-service";

const program = new Command();

program.command("code").action(() => {
  code();
});

program
  .command("login")
  .option("-p, --pat <pat>", "PAT token")
  .option("-o, --org <org>", "Azure Devops organization")
  .action(({ pat, org }) => {
    login({ pat, org });
  });

program
  .command("get-token")
  .option("-o, --org <org>", "Azure Devops organization")
  .action(async ({ org }) => {
    if (!org) {
      const { azureDevopsOrganization } = storageService.get();
      org = azureDevopsOrganization;
    }
    const token = await getToken({ org });
    console.log(token);
  });

program.parse(process.argv);

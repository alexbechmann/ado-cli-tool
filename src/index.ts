import { Command } from "commander";
import { CodeHandler } from "./handlers/code-handler";
import { LoginHandler } from "./handlers/login-handler";
import { GetTokenHandler } from "./handlers/get-token-handler";
import { container } from "tsyringe";
import inquirer from "inquirer";
import inquirerList from "inquirer-search-list";
import { AzureDevopsService } from "./common/azure-devops-service";

inquirer.registerPrompt("search-list", inquirerList);

const program = new Command();

program
  .command("code")
  .option("-s, --ssh", "Use ssh")
  .option("-c, --change-code-path", "Change code path")
  .action((args) => {
    const { ssh, changeCodePath } = args;
    const codeHandler = container.resolve(CodeHandler);
    codeHandler.code({ useSsh: ssh, changeCodePath });
  });

program
  .command("login")
  .option("-p, --pat <pat>", "PAT token")
  .option("-o, --org <org>", "Azure Devops organization")
  .action(({ pat, org }) => {
    const loginHandler = container.resolve(LoginHandler);
    loginHandler.login({ pat, org });
  });

program
  .command("get-token")
  .option("-o, --org <org>", "Azure Devops organization")
  .action(async ({ org }) => {
    const getTokenHandler = container.resolve(GetTokenHandler);
    getTokenHandler.logToken({ org });
  });

program.command("gitflow").action(async () => {
  const azureDevopsService = container.resolve(AzureDevopsService);
  const connection = await azureDevopsService.createConnection();

  const git = await connection.getGitApi();
  const policy = await connection.getPolicyApi();
  const project = "VELUX-IT-Dev";
  const policyConfig = await policy.getPolicyConfigurations(project);
  console.log({ policyConfig });
});

program.parse(process.argv);

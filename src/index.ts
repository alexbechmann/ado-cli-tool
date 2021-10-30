import { Command } from "commander";
import { CodeHandler } from "./handlers/code-handler";
import { LoginHandler } from "./handlers/login-handler";
import { GetTokenHandler } from "./handlers/get-token-handler";
import { container } from "tsyringe";

const program = new Command();

program.command("code").action(() => {
  const codeHandler = container.resolve(CodeHandler);
  codeHandler.code();
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

program.parse(process.argv);

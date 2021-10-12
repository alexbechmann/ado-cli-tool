import { Command } from "commander";
import { code } from "./code";
import { login } from "./login";

const program = new Command();

program.command("code").action(() => {
  code();
});

program
  .command("login")
  .option("-p, --pat <pat>", "PAT token")
  .action(({ pat }) => {
    login(pat);
  });

program.parse(process.argv);

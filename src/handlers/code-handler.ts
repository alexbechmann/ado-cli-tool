import inquirer, { prompt } from "inquirer";
import fs from "fs-extra";
import path from "path";
import shell from "shelljs";
import { injectable } from "tsyringe";
import { AzureDevopsService } from "../common/azure-devops-service";
import { StorageService } from "../common/storage-service";
import { GitRepository } from "azure-devops-node-api/interfaces/TfvcInterfaces";
import { TeamProjectReference } from "azure-devops-node-api/interfaces/CoreInterfaces";
import kebabCase from "just-kebab-case";
import chalk from "chalk";

@injectable()
export class CodeHandler {
  constructor(
    private azureDevopsService: AzureDevopsService,
    private storageService: StorageService
  ) {}

  async code({
    useSsh,
    changeCodePath,
  }: {
    useSsh?: boolean;
    changeCodePath: boolean;
  }) {
    const projects = await this.azureDevopsService.getProjects();

    const projectResponse = await inquirer.prompt([
      {
        name: "project",
        message: `Select project`,
        type: "search-list",
        choices: projects.map((project) => {
          project["toString"] = () => project.name;
          return {
            value: project,
            name: project.name,
          };
        }),
      },
    ]);

    const project: TeamProjectReference = projectResponse.project;

    const repos = await this.azureDevopsService.getRepos(project.id);

    let done = false;
    while (!done) {
      const repoResponse = await inquirer.prompt([
        {
          name: "repo",
          message: `Select repo`,
          type: "search-list",
          choices: repos.map((repo) => {
            repo["toString"] = () => repo.name;
            return {
              value: repo,
              name: repo.name,
            };
          }),
        },
      ]);

      const repo: GitRepository = repoResponse.repo;

      if (!this.storageService.get().codePath || changeCodePath) {
        const { newCodePath } = await inquirer.prompt([
          {
            name: "newCodePath",
            message: `What base path would you like to use to store your code`,
            type: "input",
          },
        ]);
        this.storageService.set({ codePath: newCodePath });
      }

      const { codePath, azureDevopsOrganization } = this.storageService.get();
      const projectLocation = path.resolve(
        codePath,
        kebabCase(azureDevopsOrganization),
        kebabCase(project.name)
      );

      fs.mkdirpSync(projectLocation);

      const repoLocation = path.resolve(projectLocation, kebabCase(repo.name));

      if (fs.existsSync(repoLocation)) {
      } else {
        console.log(
          `Cloning using repo: ${repo.name} on project ${project.name} at location: ${projectLocation}`
        );
        console.log(projectLocation);

        shell.cd(projectLocation);
        const cloneUrl = useSsh ? repo.sshUrl : repo.remoteUrl;

        shell.exec(`git clone ${cloneUrl} ${kebabCase(repo.name)}`);
      }

      console.log(`${chalk.green("Code location:")} ${repoLocation}`);

      const { openIn } = await inquirer.prompt([
        {
          name: "openIn",
          message: `What next?`,
          type: "search-list",
          choices: [
            {
              name: "Code",
              value: "code",
            },
            {
              name: `Another repo in ${project.name}`,
              value: "anotherRepo",
            },
            {
              name: "None",
              value: "none",
            },
          ],
        },
      ]);

      switch (openIn) {
        case "code": {
          shell.exec(`code ${repoLocation}`);
          break;
        }
        default: {
          break;
        }
      }

      if (openIn !== "anotherRepo") {
        done = true;
      }
    }
  }
}

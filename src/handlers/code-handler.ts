import inquirer from "inquirer";
import fs from "fs-extra";
import path from "path";
import shell from "shelljs";
import { injectable } from "tsyringe";
import { AzureDevopsService } from "../common/azure-devops-service";
import { StorageService } from "../common/storage-service";
import { GitRepository } from "azure-devops-node-api/interfaces/TfvcInterfaces";
import { TeamProjectReference } from "azure-devops-node-api/interfaces/CoreInterfaces";
import kebabCase from "just-kebab-case";

@injectable()
export class CodeHandler {
  constructor(
    private azureDevopsService: AzureDevopsService,
    private storageService: StorageService
  ) {}

  async code() {
    const projects = await this.azureDevopsService.getProjects();

    const projectResponse = await inquirer.prompt([
      {
        name: "project",
        message: `Select project`,
        type: "list",
        choices: projects.map((project) => {
          return {
            value: project,
            name: project.name,
          };
        }),
      },
    ]);

    const project: TeamProjectReference = projectResponse.project;

    const repos = await this.azureDevopsService.getRepos(project.id);

    const repoResponse = await inquirer.prompt([
      {
        name: "repo",
        message: `Select repo`,
        type: "list",
        choices: repos.map((repo) => {
          return {
            value: repo,
            name: repo.name,
          };
        }),
      },
    ]);

    const repo: GitRepository = repoResponse.repo;

    if (!this.storageService.get().codePath) {
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

    fs.mkdirp(projectLocation).catch(() => {});

    const repoLocation = path.resolve(projectLocation, kebabCase(repo.name));

    if (fs.existsSync(repoLocation)) {
    } else {
      console.log(
        `Cloning using repo: ${repo.name} on project ${project.name} at location: ${projectLocation}`
      );

      shell.cd(projectLocation);
      shell.exec(`git clone ${repo.remoteUrl} ${repo.name.toLowerCase()}`);
    }

    console.log(repoLocation);
    shell.exec(`code ${repoLocation}`);
  }
}

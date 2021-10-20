import inquirer from "inquirer";
import fs from "fs-extra";
import path from "path";
import shell from "shelljs";
import * as adoService from "./ado-service";
import * as storageService from "./storage-service";

export async function code() {
  const projects = await adoService.getProjects();

  const { project } = await inquirer.prompt([
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

  const repos = await adoService.getRepos(project.id);

  const { repo } = await inquirer.prompt([
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

  if (!storageService.get().codePath) {
    const { newCodePath } = await inquirer.prompt([
      {
        name: "newCodePath",
        message: `What base path would you like to use to store your code`,
        type: "input",
      },
    ]);
    storageService.set({ codePath: newCodePath });
  }

  const { codePath } = storageService.get();
  const projectLocation = path.resolve(codePath, project.name.toLowerCase());

  fs.mkdirp(projectLocation).catch(() => {});

  const repoLocation = path.resolve(projectLocation, repo.name.toLowerCase());

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

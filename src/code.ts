import inquirer from "inquirer";
import fs from "fs-extra";
import path from "path";
import shell from "shelljs";
import * as adoService from "./ado-service";

export async function code() {
  const projects = await adoService.getProjects();

  const results = await inquirer.prompt([
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

  const { project } = results;
  const repos = await adoService.getRepos(project.id);

  const repoResults = await inquirer.prompt([
    {
      name: "repo",
      message: `Select repo`,
      type: "list",
      choices: repos.map((project) => {
        return {
          value: project,
          name: project.name,
        };
      }),
    },
  ]);

  const { repo } = repoResults;

  const projectLocation = path.resolve(`c:/code/${project.name.toLowerCase()}`);

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

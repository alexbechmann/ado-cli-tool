import { injectable } from 'tsyringe';
import parse from 'parse-git-config';
import gitInfo from 'git-repo-info';
import path from 'path';
import { AzureDevopsService } from '../common/azure-devops-service';
import inquirer from 'inquirer';
import chalk from 'chalk';
import open from 'open';

@injectable()
export class CreatePRHandler {
  constructor(private azureDevopsService: AzureDevopsService) {}

  async createPR({
    sourceBranch,
    targetBranch,
    title
  }: {
    sourceBranch?: string;
    targetBranch?: string;
    title?: string;
  }) {
    const gitPath = path.resolve(process.cwd());
    const info = await parse({
      cwd: gitPath
    });
    const info2 = gitInfo(gitPath);
    const currentBranch = info2.branch;
    const originInfo = info['remote "origin"'];
    const url = originInfo.url;
    const urlChunks = url.split('/');
    const org = urlChunks[3];
    const projectName = urlChunks[4];
    const repoName = urlChunks[6];
    const repo = await this.azureDevopsService.getRepository({
      projectName,
      repositoryName: repoName
    });
    if (!sourceBranch) {
      const { sourceBranchValue } = await inquirer.prompt([
        {
          name: 'sourceBranchValue',
          type: 'input',
          default: currentBranch
        }
      ]);
      sourceBranch = sourceBranchValue;
    }
    if (!targetBranch) {
      const { targetBranchValue } = await inquirer.prompt([
        {
          name: 'targetBranchValue',
          type: 'input',
          default: repo.defaultBranch.replace('refs/heads/', '')
        }
      ]);
      targetBranch = targetBranchValue;
    }

    console.log(`Creating PR from ${sourceBranch} to ${targetBranch}`);
    const pr = await this.azureDevopsService.createPullRequest({
      sourceBranch,
      targetBranch,
      org,
      repoId: repo.id,
      title
    });

    console.log(chalk.green(`PR created`));
    const prUrl = `https://dev.azure.com/${org}/${projectName}/_git/${repoName}/pullrequest/${pr.pullRequestId}`;
    open(prUrl);
  }
}

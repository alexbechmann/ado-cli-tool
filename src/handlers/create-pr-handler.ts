import { injectable } from "tsyringe";
import parse from "parse-git-config";
import gitInfo from "git-repo-info";
import path from "path";
import { AzureDevopsService } from "../common/azure-devops-service";

@injectable()
export class CreatePRHandler {
  constructor(private azureDevopsService: AzureDevopsService) {}

  async createPR({
    sourceBranch,
    targetBranch,
  }: {
    sourceBranch: string;
    targetBranch: string;
  }) {
    //
    console.log({ sourceBranch, targetBranch });
    const gitPath = path.resolve(process.cwd());
    const info = await parse({
      cwd: gitPath,
    });

    const info2 = gitInfo(gitPath);
    const currentBranch = info2.branch;

    const originInfo = info['remote "origin"'];
    const url = originInfo.url;
    const urlChunks = url.split("/");
    const org = urlChunks[3];
    const projectName = urlChunks[4];
    const repoName = urlChunks[6];
    console.log({ org, projectName, repoName, info2 });
    const repo = await this.azureDevopsService.getRepository({
      projectName,
      repositoryName: repoName,
    });
    console.log({ repo });
  }
}

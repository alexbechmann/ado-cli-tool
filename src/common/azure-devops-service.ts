import * as storageService from "./storage-service";
import keytar from "keytar";
import * as azdev from "azure-devops-node-api";

@injectable()
export class AzureDevopsService {
  async createConnection() {
    const { azureDevopsOrganization } = storageService.get();
    const pat = await this.getToken({ org: azureDevopsOrganization });
    const authHandler = azdev.getPersonalAccessTokenHandler(pat);
    const orgUrl = `https://dev.azure.com/${azureDevopsOrganization}`;
    const connection = new azdev.WebApi(orgUrl, authHandler);
    return connection;
  }

  async storeToken({ org, token }: { org: string; token: string }) {
    await keytar.setPassword("ado-cli-tool", org, token);
  }

  getToken({ org }: { org: string }) {
    return keytar.getPassword("ado-cli-tool", org);
  }

  async getProjects() {
    console.log(`Getting projects...`);
    const connection = await this.createConnection();
    const core = await connection.getCoreApi();
    const projects = await core.getProjects();
    return projects.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
    );
  }

  async getRepos(projectId: string) {
    console.log(`Getting repos...`);
    const connection = await this.createConnection();
    const git = await connection.getGitApi();
    const repos = await git.getRepositories(projectId);
    return repos.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
    );
  }
}

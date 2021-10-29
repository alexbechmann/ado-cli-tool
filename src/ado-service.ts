import * as storageService from "./storage-service";
import keytar from "keytar";
import * as azdev from "azure-devops-node-api";

async function createConnection() {
  const pat = await getToken();
  const authHandler = azdev.getPersonalAccessTokenHandler(pat);
  const { azureDevopsOrganization } = storageService.get();
  const orgUrl = `https://dev.azure.com/${azureDevopsOrganization}`;
  const connection = new azdev.WebApi(orgUrl, authHandler);
  return connection;
}

export async function storeToken(token: string) {
  await keytar.setPassword("ado-cli-tool", "default", token);
}

export function getToken() {
  return keytar.getPassword("ado-cli-tool", "default");
}

export async function getProjects() {
  console.log(`Getting projects...`);
  const connection = await createConnection();
  const core = await connection.getCoreApi();
  const projects = await core.getProjects();
  return projects.sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
  );
}

export async function getRepos(projectId: string) {
  console.log(`Getting repos...`);
  const connection = await createConnection();
  const git = await connection.getGitApi();
  const repos = await git.getRepositories(projectId);
  return repos.sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
  );
}

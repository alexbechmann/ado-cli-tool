import axios from "axios";
import * as storageService from "./storage-service";
import keytar from "keytar";

const client = axios.create({
  baseURL: `https://dev.azure.com/${
    storageService.get().azureDevopsOrganization
  }`,
  headers: {},
});

console.log(
  `https://dev.azure.com/${storageService.get().azureDevopsOrganization}`
);

client.interceptors.request.use(async (requestConfig) => {
  const pat = await getToken();
  const patBase64 = Buffer.from(`:${pat}`).toString("base64");
  requestConfig.headers["Authorization"] = `Basic ${patBase64}`;
  return requestConfig;
});

client.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    console.log(error.response.statusText, error.response.data);
    return error.response;
  }
);

export async function storeToken(token: string) {
  await keytar.setPassword("ado-cli-tool", "default", token);
}

export function getToken() {
  return keytar.getPassword("ado-cli-tool", "default");
}

export async function getProjects(): Promise<any[]> {
  console.log(`Getting projects...`);
  const response = await client.get("/_apis/projects");
  const projects = response.data.value.sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
  );
  return projects;
}

export async function getRepos(projectId: string): Promise<any[]> {
  console.log(`Getting repos...`);
  const response = await client.get(
    `/${projectId}/_apis/git/repositories?api-version=6.1-preview.1`
  );
  const repos = response.data.value.sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
  );
  return repos;
}

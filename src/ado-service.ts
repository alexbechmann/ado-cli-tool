import axios from "axios";
import fs from "fs-extra";
import path from "path";

const client = axios.create({
  baseURL: "https://dev.azure.com/danfoss",
  headers: {},
});

client.interceptors.request.use(async (requestConfig) => {
  const pat = getToken();
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

const persistantStorageLocation = path.resolve(__dirname, "../data");
const tokenLocation = path.resolve(persistantStorageLocation, "token.txt");

fs.mkdirp(persistantStorageLocation);

export function storeToken(token: string) {
  fs.writeFileSync(tokenLocation, token);
}

export function getToken() {
  if (fs.existsSync(tokenLocation)) {
    return fs.readFileSync(tokenLocation, "utf-8");
  }
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
  //   return [];
}

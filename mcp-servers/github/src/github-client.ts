import { Octokit } from "@octokit/rest";

export interface GithubClient {
  octokit: Octokit;
  owner: string;
  repo: string;
  defaultLabels: string[];
}

export interface CreateGithubClientOptions {
  token: string;
  owner: string;
  repo: string;
  defaultLabels?: string[];
  octokit?: Octokit;
}

export function createGithubClient(opts: CreateGithubClientOptions): GithubClient {
  return {
    octokit: opts.octokit ?? new Octokit({ auth: opts.token }),
    owner: opts.owner,
    repo: opts.repo,
    defaultLabels: opts.defaultLabels ?? [],
  };
}

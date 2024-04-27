"use client";

import { useQueries, useQuery } from "@tanstack/react-query";
import { Octokit } from "octokit";

const fetchPullRequests = (auth: string, ownerRepo: string) => {
  const octokit = new Octokit({ auth });
  const [owner, repo] = ownerRepo.split("/");
  return octokit.request("GET /repos/{owner}/{repo}/pulls", {
    owner,
    repo,
    headers: {
      "X-GitHub-Api-Version": "2022-11-28",
    },
    sort: "updated",
    direction: "desc",
  });
};

const getOptions = (apiKey: string, repo: string) => ({
  queryKey: ["pull-requests", repo],
  queryFn: () => fetchPullRequests(apiKey, repo),
  refetchInterval: 60000,
});

export const usePullRequests = (apiKey: string, repo: string) => {
  const query = useQuery(getOptions(apiKey, repo));
  return query;
};

export const useManyPullRequests = (apiKey: string, repos: string[]) => {
  const query = useQueries({
    queries: repos.map((repo) => getOptions(apiKey, repo)),
  });

  return query;
};

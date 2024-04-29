"use client";

import { useQueries, useQuery } from "@tanstack/react-query";
import { Octokit } from "octokit";

const fetchPullRequests = async (auth: string, ownerRepo: string) => {
  const octokit = new Octokit({ auth });
  const [owner, repo] = ownerRepo.split("/");
  const pullsResponse = await octokit.request(
    "GET /repos/{owner}/{repo}/pulls",
    {
      owner,
      repo,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
      sort: "updated",
      direction: "desc",
    }
  );
  const pulls = pullsResponse.data;
  const detailledPullsResponse = await Promise.all(
    pulls.map((pull) =>
      octokit.request("GET /repos/{owner}/{repo}/pulls/{pull_number}", {
        owner,
        repo,
        pull_number: pull.number,
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      })
    )
  );
  const detailledPulls = detailledPullsResponse.map((r) => r.data);
  const reviewsPerPull = await Promise.all(
    detailledPulls.map((pull) =>
      octokit.request("GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews", {
        owner,
        repo,
        pull_number: pull.number,
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      })
    )
  );
  const allReviews = reviewsPerPull.flatMap((r) => r.data);
  const reviewedPulls = detailledPulls.map((pull) => ({
    ...pull,
    reviews: allReviews.filter((r) => r.pull_request_url === pull.url),
  }));
  return reviewedPulls;
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

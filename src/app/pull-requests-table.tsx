"use client";

import {
  Alert,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Link,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import moment from "moment";
import { useLocalStorage } from "usehooks-ts";

import { useManyPullRequests, usePullRequests } from "./pull-requests";
import {
  GitPullRequestDraftIcon,
  GitMergeQueueIcon,
} from "@primer/octicons-react";

const formatDate = (dateString: string) => {
  const date = moment(dateString);
  if (date.isSame(moment(), "day")) return date.format("LT");
  else return date.format("ll");
};

export const PullRequestsTable = () => {
  const [repos, setRepos] = useLocalStorage("repo", "...");
  const reposAsArray = repos.split(/\s*,\s*/).filter((r) => r.match(".+/.+"));
  const [apiKey, setAPIKey] = useLocalStorage("api-key", "...");
  const [drafts, setDrafts] = useLocalStorage("drafts", false);
  const queries = useManyPullRequests(apiKey, reposAsArray);
  const pulls = queries
    .flatMap((q) => q.data?.data || [])
    .sort((a, b) => moment(b.updated_at).diff(moment(a.updated_at)))
    .filter((pull) => drafts || !pull.draft);
  return (
    <Stack spacing={4}>
      <Stack direction={"row"} spacing={2} alignItems={"center"}>
        <TextField
          label="GitHub API Key"
          value={apiKey}
          onChange={(e) => setAPIKey(e.target.value)}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={drafts}
              onChange={(_, checked) => setDrafts(checked)}
              inputProps={{ "aria-label": "controlled" }}
            />
          }
          label="Show Drafts?"
        />
        <TextField
          label="Repositories, comma separated"
          value={repos}
          onChange={(e) => setRepos(e.target.value)}
          fullWidth
        />
        <CircularProgress
          size={24}
          sx={{
            visibility: queries.some((q) => q.isFetching)
              ? "visible"
              : "hidden",
          }}
        />
      </Stack>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Updated At</TableCell>
            <TableCell>Waiting</TableCell>
            <TableCell>Repository</TableCell>
            <TableCell>&nbsp;</TableCell>
            <TableCell>PR Title</TableCell>
            <TableCell>Author</TableCell>
            <TableCell>Created At</TableCell>
            <TableCell>sha</TableCell>
            <TableCell>Reviewers</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {pulls.map((pull) => (
            <TableRow key={pull.id}>
              <TableCell>{formatDate(pull.updated_at)}</TableCell>
              <TableCell>{moment(pull.updated_at).fromNow(true)}</TableCell>
              <TableCell>{pull.base.repo.full_name}</TableCell>
              <TableCell align="right">
                {pull.auto_merge && <GitMergeQueueIcon />}
                {pull.draft && <GitPullRequestDraftIcon />}
              </TableCell>
              <TableCell
                sx={{
                  maxWidth: "350px",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                }}
              >
                <Link href={pull.html_url} target="_blank">
                  {pull.title}
                </Link>
              </TableCell>
              <TableCell>{pull.user?.login}</TableCell>
              <TableCell>{formatDate(pull.created_at)}</TableCell>
              <TableCell>
                <code>{pull.merge_commit_sha?.substring(0, 6)}</code>
              </TableCell>
              <TableCell>
                {pull.requested_reviewers?.map((r) => r.login).join(", ")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {queries.map((q, i) => (
        <>
          {q.error && (
            <Alert severity="error" key={reposAsArray[i]}>
              {q.error.message} ({reposAsArray[i]})
            </Alert>
          )}
        </>
      ))}
    </Stack>
  );
};

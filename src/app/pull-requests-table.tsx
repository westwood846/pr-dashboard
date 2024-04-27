"use client";

import {
  Alert,
  CircularProgress,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  styled,
} from "@mui/material";
import { OpenInNew } from "@mui/icons-material";
import moment from "moment";
import { useLocalStorage } from "usehooks-ts";

import { usePullRequests } from "./pull-requests";
import { useState } from "react";

const formatDate = (dateString: string) => {
  const date = moment(dateString);
  if (date.isSame(moment(), "day")) return date.format("LT");
  else return date.format("ll");
};

export const PullRequestsTable = () => {
  const [repo, setRepo] = useLocalStorage("repo", "DFHack/dfhack");
  const [apiKey, setAPIKey] = useLocalStorage("api-key", "");
  const { data: pulls, isFetching, error } = usePullRequests(apiKey, repo);
  return (
    <Stack spacing={4}>
      <Stack direction={"row"} spacing={2} alignItems={"center"}>
        <TextField
          label="GitHub API Key"
          value={apiKey}
          onChange={(e) => setAPIKey(e.target.value)}
        />
        <TextField
          label="Repository"
          value={repo}
          onChange={(e) => setRepo(e.target.value)}
        />
        <CircularProgress
          size={24}
          sx={{ visibility: isFetching ? "visible" : "hidden" }}
        />
      </Stack>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Repository</TableCell>
            <TableCell>PR Title</TableCell>
            <TableCell>Author</TableCell>
            <TableCell>Created At</TableCell>
            <TableCell>Updated At</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>automerge</TableCell>
            <TableCell>Draft</TableCell>
            <TableCell>sha</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(pulls?.data || []).map((pull) => (
            <TableRow key={pull.id}>
              <TableCell>{pull.base.repo.full_name}</TableCell>
              <TableCell>{pull.title}</TableCell>
              <TableCell>{pull.user?.login}</TableCell>
              <TableCell>{formatDate(pull.created_at)}</TableCell>
              <TableCell>{formatDate(pull.updated_at)}</TableCell>
              <TableCell>{pull.state}</TableCell>
              <TableCell>{pull.auto_merge ? "Enabled" : "No"}</TableCell>
              <TableCell>{pull.draft ? "Draft" : "Ready"}</TableCell>
              <TableCell>
                <code>{pull.merge_commit_sha?.substring(0, 6)}</code>
              </TableCell>
              <TableCell>
                <IconButton
                  component="a"
                  href={pull.html_url}
                  target="_blank"
                  size="small"
                >
                  <OpenInNew />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {error && <Alert severity="error">{error.message}</Alert>}
    </Stack>
  );
};

const Toolbar = styled("div")(({ theme }) => ({
  display: "flex",
  marginBottom: theme.spacing(2),
  // backgroundColor: theme.palette.primary.main,
  // borderRadius: "20px",
}));

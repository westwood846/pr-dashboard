"use client";

import {
  Alert,
  Avatar,
  AvatarGroup,
  Checkbox,
  Chip,
  CircularProgress,
  FormControlLabel,
  Link,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import moment from "moment";
import { useLocalStorage } from "usehooks-ts";

import { useManyPullRequests, usePullRequests } from "./pull-requests";
import {
  GitPullRequestDraftIcon,
  GitMergeQueueIcon,
  CheckIcon,
  FileDiffIcon,
  CommentIcon,
} from "@primer/octicons-react";
import { CheckCircleOutline } from "@mui/icons-material";
import { useEffect } from "react";
import { groupBy, uniqBy } from "lodash";

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
  const [negFilter, setNegFilter] = useLocalStorage("Negative Filter", "");
  const queries = useManyPullRequests(apiKey, reposAsArray);
  const pulls = queries
    .flatMap((q) => q.data || [])
    .sort((a, b) => moment(b.updated_at).diff(moment(a.updated_at)))
    .filter((pull) => drafts || !pull.draft)
    .filter((pull) => !negFilter || !JSON.stringify(pull).includes(negFilter));

  useEffect(() => {
    if (pulls) console.log(pulls);
  }, [pulls]);

  return (
    <Stack spacing={4}>
      <Stack direction={"row"} spacing={2} alignItems={"center"}>
        <TextField
          label="GitHub API Key"
          value={apiKey}
          onChange={(e) => setAPIKey(e.target.value)}
          size="small"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={drafts}
              onChange={(_, checked) => setDrafts(checked)}
              inputProps={{ "aria-label": "controlled" }}
              size="small"
            />
          }
          label="Show Drafts?"
          slotProps={{ typography: { sx: { minWidth: "100px" } } }}
        />
        <TextField
          label="Repositories, comma separated"
          value={repos}
          onChange={(e) => setRepos(e.target.value)}
          fullWidth
          size="small"
        />
        <TextField
          label="Negative Filter"
          value={negFilter}
          onChange={(e) => setNegFilter(e.target.value)}
          size="small"
        />
        <CircularProgress
          size={16}
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
            <TableCell sx={{ textAlign: "right" }}>Updated At</TableCell>
            <TableCell>Waiting</TableCell>
            <TableCell sx={{ textAlign: "right" }}>Repository</TableCell>
            {/* <TableCell>&nbsp;</TableCell> */}
            <TableCell>PR Title</TableCell>
            <TableCell>Author</TableCell>
            <TableCell>Created At</TableCell>
            <TableCell>sha</TableCell>
            {/* <TableCell>Reviewers</TableCell> */}
            {/* <TableCell>Comments</TableCell> */}
            <TableCell>Reviews</TableCell>
            <TableCell>Diff</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {pulls.map((pull) => (
            <TableRow key={pull.id}>
              <TableCell sx={{ textAlign: "right" }}>
                {formatDate(pull.updated_at)}
              </TableCell>
              <TableCell>{moment(pull.updated_at).fromNow(true)}</TableCell>
              <TableCell sx={{ textAlign: "right" }}>
                {pull.base.repo.full_name}
              </TableCell>
              {/* <TableCell align="right">
                {pull.auto_merge && (
                  <Tooltip title="Automerge is enabled">
                    <GitMergeQueueIcon />
                  </Tooltip>
                )}
                {pull.draft && (
                  <Tooltip title="This is a draft">
                    <GitPullRequestDraftIcon />
                  </Tooltip>
                )}
                {pull.mergeable && (
                  <CheckCircleOutline color="success" sx={{ fontSize: 16 }} />
                )}
              </TableCell> */}
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
                <code>{pull.merge_commit_sha?.substring(0, 8)}</code>
              </TableCell>
              {/* <TableCell>
                {pull.requested_reviewers?.map((r) => r.login).join(", ")}
              </TableCell> */}
              {/* <TableCell>
                {pull.comments} / {pull.review_comments}
              </TableCell> */}
              <TableCell>
                <ReviewChip reviews={pull.reviews} state="APPROVED" />
                <ReviewChip reviews={pull.reviews} state="CHANGES_REQUESTED" />
                <ReviewChip reviews={pull.reviews} state="COMMENTED" />
              </TableCell>
              <TableCell>
                <pre>
                  <code>
                    {/* <Typography component={"span"} fontSize={14}>
                      #{pull.commits}
                    </Typography>{" "} */}
                    <Typography component={"span"} color="green" fontSize={14}>
                      +{pull.additions}
                    </Typography>{" "}
                    <Typography component={"span"} color="red" fontSize={14}>
                      -{pull.deletions}
                    </Typography>
                  </code>
                </pre>
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

type Review = NonNullable<
  ReturnType<typeof useManyPullRequests>[number]["data"]
>[number]["reviews"][number];
type State = Review["state"];

const StatusMeta = {
  APPROVED: [CheckIcon, "green", "approved this pull request"],
  CHANGES_REQUESTED: [FileDiffIcon, "red", "requested changes"],
  COMMENTED: [CommentIcon, "black", "commented"],
} as Record<State, [React.ElementType, string, string]>;

interface Props {
  reviews: Review[];
  state: State;
}

const ReviewChip = ({ reviews, state }: Props) => {
  const reviewsForState = reviews.filter((r) => r.state === state);
  if (!reviewsForState.length) return null;
  const uniqueReviewsForState = uniqBy(reviewsForState, (r) => r.user?.login);
  const [Icon, color, title] = StatusMeta[state];
  return (
    <Tooltip
      title={`${uniqueReviewsForState
        .map((r) => r.user?.login || "Unknown")
        .join(", ")} ${title}`}
    >
      <Chip
        label={
          <Stack direction={"row"} alignItems={"center"} spacing={0.25}>
            <AvatarGroup>
              {uniqueReviewsForState.map((r) => (
                <Avatar
                  key={r.id}
                  alt={r.user?.login}
                  src={r.user?.avatar_url}
                  sx={{ width: 13, height: 13 }}
                />
              ))}
            </AvatarGroup>
            <Icon fill={color} />
          </Stack>
        }
        size="small"
      />
    </Tooltip>
  );
};

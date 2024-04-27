import { Container, Typography } from "@mui/material";
import { PullRequestsTable } from "./pull-requests-table";
import { Providers } from "./providers";

export default function Home() {
  return (
    <Providers>
      <Container component="main" maxWidth="xl">
        <Typography variant="h1" sx={{ mb: 2 }}>
          PR Dashboard
        </Typography>
        <PullRequestsTable />
      </Container>
    </Providers>
  );
}

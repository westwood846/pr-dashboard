import { Container, Typography } from "@mui/material";
import { PullRequestsTable } from "./pull-requests-table";
import { Providers } from "./providers";

export default function Home() {
  return (
    <Providers>
      <Container component="main" maxWidth="xl" sx={{ py: 4 }}>
        <PullRequestsTable />
      </Container>
    </Providers>
  );
}

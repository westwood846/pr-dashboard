import { Container, Typography } from "@mui/material";
import { PullRequestsTable } from "./pull-requests-table";
import { Providers } from "./providers";

export default function Home() {
  return (
    <Providers>
      <Container component="main" maxWidth={false} sx={{ py: 3 }}>
        <PullRequestsTable />
      </Container>
    </Providers>
  );
}

"use client";

import { ThemeProvider, createTheme } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  ErrorBoundary,
  ErrorComponent,
} from "next/dist/client/components/error-boundary";
import { Suspense } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

const MyErrorComponent: ErrorComponent = ({ error }) => {
  return <div>Error! {error.message}</div>;
};

const theme = createTheme({
  components: {
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: "6px 8px",
        },
      },
    },
  },
});

interface Props {
  children: React.ReactNode;
}

export const Providers = ({ children }: Props) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary errorComponent={MyErrorComponent}>
        <Suspense fallback={<div>Loading...</div>}>
          <ThemeProvider theme={theme}>{children}</ThemeProvider>
        </Suspense>
      </ErrorBoundary>
    </QueryClientProvider>
  );
};

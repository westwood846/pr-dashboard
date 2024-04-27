"use client";

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

interface Props {
  children: React.ReactNode;
}

export const Providers = ({ children }: Props) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary errorComponent={MyErrorComponent}>
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
      </ErrorBoundary>
    </QueryClientProvider>
  );
};

"use client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";


export default function QueryProvider({ children }: { children: React.ReactNode }) 
{
    const [client] = useState(
        () => new QueryClient(
            {
                defaultOptions: {
                    queries: {
                        refetchOnWindowFocus: false,
                        retry: 1,
                        staleTime: 15 * 60_000, // 15 minutes
                    },
                },
            }
        )
    
    );

    return <QueryClientProvider client={client}>
        {children}
    </QueryClientProvider>
}
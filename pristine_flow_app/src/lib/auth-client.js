import { createAuthClient } from "better-auth/react";

const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5002" : "");
export const authClient = createAuthClient({
    baseURL: apiUrl ? `${apiUrl.replace(/\/$/, "")}/api/auth` : "/api/auth"
});

export const { 
    signIn, 
    signOut, 
    useSession 
} = authClient;

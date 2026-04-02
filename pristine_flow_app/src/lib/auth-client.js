import { createAuthClient } from "better-auth/react";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5002";
export const authClient = createAuthClient({
    baseURL: `${apiUrl.replace(/\/$/, "")}/api/auth`
});

export const { 
    signIn, 
    signOut, 
    useSession 
} = authClient;

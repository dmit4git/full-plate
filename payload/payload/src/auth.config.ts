import type { NextAuthConfig } from "next-auth";
import keycloak from "next-auth/providers/keycloak";

export const authConfig: NextAuthConfig = {
    providers: [
        keycloak, // <-- Add your provider here
    ],
};

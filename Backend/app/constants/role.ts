export const ROLE = {
    ADMIN: "admin",
    USER: "user",
} as const;

export type RoleTypeKey = keyof typeof ROLE;
export type RoleTypeValue = (typeof ROLE)[RoleTypeKey];

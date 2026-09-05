export type User = {
  sub: string;
  name: string;
  email: string;
  email_verified: boolean;
};

export const mockUsers: User[] = ["Alison", "John", "Maria", "Xavier"].map(
  (name) => ({
    sub: `auth0|${name.toLowerCase()}`,
    name,
    email: `${name.toLowerCase()}@example.com`,
    email_verified: true,
  }),
);

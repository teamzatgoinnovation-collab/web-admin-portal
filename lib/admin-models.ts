export type UserRecord = {
  id: string;
  email: string;
  fullName: string;
  roles: string[];
  enabled: boolean;
  companyId: string;
};

export type RoleRecord = {
  id: string;
  name: string;
  description: string;
  userCount: number;
};

export type CompanyRecord = {
  id: string;
  name: string;
  abbr: string;
  country: string;
  defaultCurrency: string;
};

export type BranchRecord = {
  id: string;
  name: string;
  companyId: string;
  city: string;
  active: boolean;
};

export type LogRecord = {
  id: string;
  timestamp: string;
  level: "info" | "warning" | "error";
  actor: string;
  action: string;
  detail: string;
};

export type ApiKeyRecord = {
  id: string;
  label: string;
  userEmail: string;
  keyHint: string;
  createdAt: string;
  lastUsedAt: string | null;
  enabled: boolean;
};

import { ZatGoApi } from "@zatgo/erpnext";
import { callZatGoApi } from "@/lib/call-zatgo-api";
import type {
  ApiKeyRecord,
  BranchRecord,
  CompanyRecord,
  LogRecord,
  RoleRecord,
  UserRecord,
} from "./admin-models";

export type * from "./admin-models";

const NOT_READY = "ERPNext admin mutations are not available yet.";

function asRows(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data)) return data as Record<string, unknown>[];
  return [];
}

async function overviewRows() {
  const env = await callZatGoApi<unknown[]>(ZatGoApi.admin.overviewList, {
    page: 1,
    page_size: 100,
  });
  return asRows(env.data);
}

function notReady<T>(): Promise<T> {
  return Promise.reject(new Error(NOT_READY));
}

/** Live ERPNext-backed admin data via zatgo_core.admin (no mock seed). */
export const mockRepo = {
  async counts() {
    await callZatGoApi(ZatGoApi.admin.ping);
    const rows = await overviewRows();
    return {
      users: 0,
      roles: 0,
      companies: 0,
      branches: 0,
      apiKeys: 0,
      logs: 0,
      enabledUsers: 0,
      overview: rows.length,
    };
  },
  async listUsers(): Promise<UserRecord[]> {
    return [];
  },
  async listRoles(): Promise<RoleRecord[]> {
    return [];
  },
  async listCompanies(): Promise<CompanyRecord[]> {
    return [];
  },
  async listBranches(): Promise<BranchRecord[]> {
    return [];
  },
  async listLogs(): Promise<LogRecord[]> {
    return [];
  },
  async listApiKeys(): Promise<ApiKeyRecord[]> {
    return [];
  },
  async upsertUser(input: Omit<UserRecord, "id"> & { id?: string }): Promise<UserRecord> {
    return notReady();
  },
  async deleteUser(_id: string): Promise<void> {
    return notReady();
  },
  async upsertRole(
    input: Omit<RoleRecord, "id" | "userCount"> & { id?: string; userCount?: number },
  ): Promise<RoleRecord> {
    return notReady();
  },
  async deleteRole(_id: string): Promise<void> {
    return notReady();
  },
  async upsertCompany(input: Omit<CompanyRecord, "id"> & { id?: string }): Promise<CompanyRecord> {
    return notReady();
  },
  async deleteCompany(_id: string): Promise<void> {
    return notReady();
  },
  async upsertBranch(input: Omit<BranchRecord, "id"> & { id?: string }): Promise<BranchRecord> {
    return notReady();
  },
  async deleteBranch(_id: string): Promise<void> {
    return notReady();
  },
  async upsertApiKey(
    input: Omit<ApiKeyRecord, "id" | "keyHint" | "createdAt" | "lastUsedAt"> & {
      id?: string;
      keyHint?: string;
      createdAt?: string;
      lastUsedAt?: string | null;
    },
  ): Promise<ApiKeyRecord> {
    return notReady();
  },
  async deleteApiKey(_id: string): Promise<void> {
    return notReady();
  },
};

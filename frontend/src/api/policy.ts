// frontend/src/api/policy.ts
import client from "./client";

export interface PolicyResponse {
    id: number;
    type: string;
    content: string;
    version: string;
    effectiveDate: string;
}

export const getLatestTerms = () => client.get<PolicyResponse>("/policy/terms");
export const getLatestPrivacy = () => client.get<PolicyResponse>("/policy/privacy");
import { Subsequence } from "./subsequence";
export interface Sequence {
    id: string;
    name: string;
    workspaceId: string;
    state: string;
    subsequences: Subsequence[];
}
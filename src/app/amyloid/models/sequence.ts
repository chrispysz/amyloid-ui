import { Subsequence } from "./subsequence";
export interface Sequence {
    id: string;
    name: string;
    state: string;
    value: string;
    subsequences: Subsequence[];
}
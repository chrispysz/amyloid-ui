import { Subsequence } from './subsequence';
import { PredictLog } from './predictLog';
export interface Sequence {
  id: string;
  name: string;
  state: string;
  value: string;
  subsequences: Subsequence[];
  predictLogs: PredictLog[];
}


import { ModelPrediction } from './modelPrediction';
import { PredictLog } from './predictLog';
export interface Sequence {
  id: string;
  name: string;
  value: string;
  modelPredictions: ModelPrediction[];
  predictLogs: PredictLog[];
}

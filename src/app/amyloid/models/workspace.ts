import { Sequence } from './sequence';
export interface Workspace {
  id: string;
  name: string;
  sequences: Sequence[];
  created: string;
  updated: string;
}

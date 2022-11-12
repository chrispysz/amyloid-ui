import { FieldValue } from '@angular/fire/firestore';
import { Sequence } from './sequence';
export interface Workspace {
  id: string;
  name: string;
  sequences: Sequence[];
  created: FieldValue;
  updated: FieldValue;
}

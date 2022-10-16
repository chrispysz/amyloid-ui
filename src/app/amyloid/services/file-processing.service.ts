import { Injectable } from '@angular/core';
import { Sequence } from '../models/sequence';

@Injectable({
  providedIn: 'root',
})
export class FileProcessingService {
  constructor() {}

  prepareSequenceObjects(fileContent: string): Sequence[] {
    const sequences: Sequence[] = [];
    let recentName = '';
    let indexCounter = 0;

    const splitData = fileContent.split('\n');

    splitData.forEach((line) => {
      if (line.startsWith('>') && line.trim().length) {
        recentName = line.trim();
        indexCounter += 1;
      }
      if (!line.startsWith('>') && line.trim().length) {
        let sequence: Sequence = {
          id: Date.now().toString() + '-' + indexCounter.toString(),
          name: recentName.replace('>', ''),
          value: this.cleanLine(line),
          state: 'PENDING',
          subsequences: [],
          predictLog: '',
        };
        sequences.push(sequence);
      }
    });

    return sequences;
  }

  cleanLine(sequence: string): string {
    return sequence.replace(/[\r\n]/gm, '');
  }

  cleanFileName(fileName: string): string {
    return fileName.replace(/^.*[\\\/]/, '');
  }

  fileContentProcessable(fileContent: string): boolean {
    return this.compatibleWithFASTA(fileContent);
  }

  private compatibleWithFASTA(fileContent: string): boolean {
    return fileContent.startsWith('>');
  }
}

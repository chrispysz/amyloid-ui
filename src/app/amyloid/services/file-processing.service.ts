import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FileProcessingService {

  constructor() { }

  fileContentProcessable(fileContent: string): boolean {
    return this.compatibleWithFASTA(fileContent);
  }

  private compatibleWithFASTA(fileContent: string): boolean {
    return fileContent.startsWith('>');
  }
}

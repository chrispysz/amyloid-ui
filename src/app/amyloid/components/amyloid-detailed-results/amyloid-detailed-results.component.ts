import { Component, Input, OnInit } from '@angular/core';
import { PredictedSubsequence } from '../../models/predictedSubsequence';
import { Sequence } from '../../models/sequence';

@Component({
  selector: 'app-amyloid-detailed-results',
  templateUrl: './amyloid-detailed-results.component.html',
  styleUrls: ['./amyloid-detailed-results.component.scss']
})
export class AmyloidDetailedResultsComponent implements OnInit {

  @Input() sequence: Sequence | undefined;

  subsequences: PredictedSubsequence[] = [];

  constructor() { }

  ngOnInit(): void {
    let jsonifiedLog = this.sequence!.predictLog.replace(/'/g, '"');
    this.subsequences = JSON.parse(jsonifiedLog);
    console.log(this.subsequences);
  }

  parseFloat(value: string): number {
    return parseFloat(value);
  }

}

import { Component, Input, OnInit } from '@angular/core';
import { PredictedSubsequence } from '../../models/predictedSubsequence';
import { Sequence } from '../../models/sequence';

@Component({
  selector: 'app-amyloid-detailed-results',
  templateUrl: './amyloid-detailed-results.component.html',
  styleUrls: ['./amyloid-detailed-results.component.scss'],
})
export class AmyloidDetailedResultsComponent implements OnInit {
  @Input() sequences: PredictedSubsequence[] | undefined;

  constructor() {}

  ngOnInit(): void {
  }

  

  parseFloat(value: string): number {
    return parseFloat(value);
  }
}

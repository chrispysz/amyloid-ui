import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { Sequence } from '../../models/sequence';
import { PredictionService } from '../../services/prediction.service';
import { from, concatMap } from 'rxjs';

@Component({
  selector: 'app-amyloid-workspace-details',
  templateUrl: './amyloid-workspace-details.component.html',
  styleUrls: ['./amyloid-workspace-details.component.scss'],
})
export class AmyloidWorkspaceDetailsComponent implements OnInit {
  sequences: Sequence[] | undefined;
  predictionInProgress: boolean = false;
  idBeingPredicted: string | undefined;
  predictionProgress: number = 0;
  currentSequenceNumber: number = 1;
  lastSequenceNumber: number = 0;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly predictionService: PredictionService
  ) {}

  ngOnInit(): void {
    this.route.data
      .pipe(map((data) => data['workspace'][0]!.sequences))
      .subscribe((result) => {
        this.sequences = result;
        console.log(this.sequences);
      });
  }

  predict(sequence: string, id: string): void {
    this.predictionInProgress = true;
    this.idBeingPredicted = id;

    const sequences40 = this.createSubsequences(sequence);

    this.lastSequenceNumber = sequences40.length;

    this.predictionProgress = Math.round(
      (this.currentSequenceNumber / this.lastSequenceNumber) * 100
    );
    from(sequences40)
      .pipe(
        concatMap((sequence) => this.predictionService.predictSingle(sequence))
      )
      .subscribe((object: Object) => {
        console.log(
          `Predicted with response: ${JSON.stringify(object, null, 4)}`
        );
        if (this.currentSequenceNumber == this.lastSequenceNumber) {
          //TODO do something with pred results on finish
          console.log('Finished predicting');
          this.resetPredictionProgress();
        } else {
          if (this.currentSequenceNumber < this.lastSequenceNumber) {
            this.currentSequenceNumber++;
          }
          this.predictionProgress = Math.round(
            (this.currentSequenceNumber / this.lastSequenceNumber) * 100
          );
        }
      });
  }

  private resetPredictionProgress(): void {
    this.predictionInProgress = false;
    this.predictionProgress = 0;
    this.currentSequenceNumber = 1;
  }

  private createSubsequences(sequence: string): string[] {
    const sequences40 = [];
    const characterSplits = sequence.split('');
    if (characterSplits.length < 40) {
      sequences40.push(sequence);
    } else {
      for (let i = 0; i < characterSplits.length; i++) {
        let sequence40 = characterSplits.slice(i, i + 40).join('');
        if (sequence40.length == 40) {
          sequences40.push(sequence40);
        }
      }
    }
    return sequences40;
  }
}

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { Sequence } from '../../models/sequence';
import { PredictionService } from '../../services/prediction.service';
import { from, concatMap } from 'rxjs';
import { Workspace } from '../../models/workspace';
import { WorkspaceService } from '../../services/workspace.service';

@Component({
  selector: 'app-amyloid-workspace-details',
  templateUrl: './amyloid-workspace-details.component.html',
  styleUrls: ['./amyloid-workspace-details.component.scss'],
})
export class AmyloidWorkspaceDetailsComponent implements OnInit {
  workspace: Workspace | undefined;
  sequences: Sequence[] | undefined;
  predictionInProgress: boolean = false;
  idBeingPredicted: string | undefined;
  predictionProgress: number = 0;
  currentSequenceNumber: number = 1;
  lastSequenceNumber: number = 0;
  allResults: string = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly predictionService: PredictionService,
    private readonly workspaceService: WorkspaceService
  ) {}

  ngOnInit(): void {
    this.route.data
      .pipe(map((data) => data['workspace'][0]))
      .subscribe((result) => {
        this.workspace = result;
        this.sequences = result.sequences;
      });
  }

  editSequence(sequence: string, id: string): void {
    //TODO implement
  }

  showSequencePredictionResults(sequence: string, id: string): void {
    //TODO implement
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
        if (this.currentSequenceNumber == this.lastSequenceNumber) {
          console.log('Finished predicting');
          console.log(this.allResults);
          let currentSequence = this.sequences!.find((s) => s.id == id);
          if (
            this.allResults.includes('Positive') &&
            currentSequence?.state != 'POSITIVE'
          ) {
            this.sequences!.find((s) => s.id == id)!.state = 'POSITIVE';
            this!.workspace!.sequences = this.sequences!;
            this.workspaceService.update(this.workspace!).subscribe();
          } else if (
            this.allResults.includes('Negative') &&
            currentSequence?.state != 'NEGATIVE'
          ) {
            this.sequences!.find((s) => s.id == id)!.state = 'NEGATIVE';
            this!.workspace!.sequences = this.sequences!;
            this.workspaceService.update(this.workspace!).subscribe();
          }

          this.resetPredictionProgress();
        } else {
          if (this.currentSequenceNumber < this.lastSequenceNumber) {
            this.allResults += JSON.stringify(object) + '\n\n';
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
    this.allResults = '';
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

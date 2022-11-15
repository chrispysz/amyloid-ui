import { Component, Input, OnInit } from '@angular/core';
import { ProcessStep } from '../../models/processStep';

@Component({
  selector: 'app-amyloid-prediction-progress',
  templateUrl: './amyloid-prediction-progress.component.html',
  styleUrls: ['./amyloid-prediction-progress.component.scss'],
})
export class AmyloidPredictionProgressComponent implements OnInit {
  @Input() steps: ProcessStep[] = [];

  constructor() {}

  ngOnInit(): void {}

  getStepClass(step: ProcessStep): string {
    switch (step.name) {
      case 'CONNECTION_CHECK':
        switch (step.status) {
          case 'SUCCESSFUL':
            return 'bi bi-broadcast-pin icon text-success';
          case 'FAILED':
            return 'bi bi-broadcast-pin icon text-danger';
          default:
            return 'bi bi-broadcast-pin icon';
        }
      case 'PREDICTION':
        switch (step.status) {
          case 'SUCCESSFUL':
            return 'bi bi-cpu icon text-success';
          case 'FAILED':
            return 'bi bi-cpu icon text-danger';
          default:
            return 'bi bi-cpu icon';
        }
      case 'SAVING':
        switch (step.status) {
          case 'SUCCESSFUL':
            return 'bi bi-save icon text-success';
          case 'FAILED':
            return 'bi bi-save icon text-danger';
          default:
            return 'bi bi-save icon';
        }
    }
    switch (step.status) {
      case 'SUCCESSFUL':
        return 'bi bi-broadcast-pin icon text-success';
      case 'FAILED':
        return 'bi bi-broadcast-pin icon text-danger';
      default:
        return 'bi bi-broadcast-pin icon';
    }
  }

  stepStarted(step: ProcessStep): boolean {
    return step.status !== 'NOT_STARTED' ? true : false;
  }
}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AmyloidDashboardComponent } from './components/amyloid-dashboard/amyloid-dashboard.component';
import { AmyloidWorkspaceComponent } from './components/amyloid-workspace/amyloid-workspace.component';
import { WorkspaceService } from './services/workspace.service';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PredictionService } from './services/prediction.service';
import { FileProcessingService } from './services/file-processing.service';
import { AmyloidWorkspaceDetailsComponent } from './components/amyloid-workspace-details/amyloid-workspace-details.component';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AmyloidDetailedResultsComponent } from './components/amyloid-detailed-results/amyloid-detailed-results.component';
import { AmyloidWorkspaceSettingsComponent } from './components/amyloid-workspace-settings/amyloid-workspace-settings.component';
import { AmyloidModelCardComponent } from './components/amyloid-model-card/amyloid-model-card.component';

@NgModule({
  declarations: [
    AmyloidDashboardComponent,
    AmyloidWorkspaceComponent,
    NotFoundComponent,
    AmyloidWorkspaceDetailsComponent,
    AmyloidDetailedResultsComponent,
    AmyloidWorkspaceSettingsComponent,
    AmyloidModelCardComponent,
  ],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, NgbModule],
  providers: [
    WorkspaceService,
    PredictionService,
    FileProcessingService
  ],
  exports: [
    AmyloidDashboardComponent,
    AmyloidWorkspaceComponent,
    AmyloidWorkspaceDetailsComponent,
    NotFoundComponent,
  ],
})
export class AmyloidModule {}

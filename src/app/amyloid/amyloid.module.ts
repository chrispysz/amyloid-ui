import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AmyloidDashboardComponent } from './components/amyloid-dashboard/amyloid-dashboard.component';
import { AmyloidWorkspaceComponent } from './components/amyloid-workspace/amyloid-workspace.component';



@NgModule({
  declarations: [
    AmyloidDashboardComponent,
    AmyloidWorkspaceComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    AmyloidDashboardComponent,
    AmyloidWorkspaceComponent
  ]
})
export class AmyloidModule { }

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AmyloidWorkspaceComponent } from './amyloid/components/amyloid-workspace/amyloid-workspace.component';
import { NotFoundComponent } from './amyloid/components/not-found/not-found.component';
import { AmyloidDashboardComponent } from './amyloid/components/amyloid-dashboard/amyloid-dashboard.component';
import { AmyloidWorkspaceDetailsComponent } from './amyloid/components/amyloid-workspace-details/amyloid-workspace-details.component';
import { AmyloidWorkspaceSettingsComponent } from './amyloid/components/amyloid-workspace-settings/amyloid-workspace-settings.component';
import { AuthGuard } from './amyloid/guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/amyloid/dashboard', pathMatch: 'full' },
  {
    path: 'amyloid',
    loadChildren: () =>
      import('./amyloid/amyloid.module').then((module) => module.AmyloidModule),
  },
  {
    path: 'amyloid/dashboard',
    component: AmyloidDashboardComponent,
    title: 'Dashboard - AmyloTool',
  },
  {
    path: 'amyloid/workspaces',
    component: AmyloidWorkspaceComponent,
    title: 'Workspaces - AmyloTool',
  },
  {
    path: 'amyloid/details',
    component: AmyloidWorkspaceDetailsComponent,
    title: 'Workspace details - AmyloTool',
    canActivate: [AuthGuard],
  },
  {
    path: 'amyloid/settings',
    component: AmyloidWorkspaceSettingsComponent,
    title: 'Workspace settings - AmyloTool',
    canActivate: [AuthGuard],
  },
  { path: 'not-found', component: NotFoundComponent, title: 'Not Found' },
  { path: '**', redirectTo: 'not-found' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

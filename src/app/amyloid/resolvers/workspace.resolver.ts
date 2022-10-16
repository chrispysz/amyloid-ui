import { Injectable } from '@angular/core';
import { Router, Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';
import { Workspace } from '../models/workspace';
import { WorkspaceService } from '../services/workspace.service';

@Injectable({
  providedIn: 'root',
})
export class WorkspaceResolver implements Resolve<Workspace> {
  constructor(
    private readonly workspaceService: WorkspaceService,
    private readonly router: Router
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<Workspace> {
    const workspaceId = +route.paramMap.get('id')!;
    return this.workspaceService.get(workspaceId.toString()).pipe(
      catchError(() => {
        this.router.navigate(['/amyloid/workspaces']);
        return throwError(
          () => new Error('Workspace with ID ${id} could not be found!')
        );
      })
    );
  }
}

import { Injectable, NgZone } from '@angular/core';
import { Router, Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { catchError, lastValueFrom, Observable, throwError } from 'rxjs';
import { Workspace } from '../models/workspace';
import { WorkspaceService } from '../services/workspace.service';

@Injectable({
  providedIn: 'root',
})
export class WorkspaceResolver implements Resolve<Workspace> {
  constructor(
    private readonly workspaceService: WorkspaceService,
    private readonly router: Router,
    private ngZone: NgZone
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<Workspace> {
    const workspaceId = +route.paramMap.get('id')!;
    return this.workspaceService.get(workspaceId.toString()).pipe(
      catchError(() => {
        this.ngZone.run(() => {
          this.router.navigate(['/amyloid/dashboard']);
        });

        return throwError(
          () => new Error('Workspace with ID ${id} could not be found!')
        );
      })
    );
  }
}

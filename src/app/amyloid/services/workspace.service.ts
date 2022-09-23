import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Workspace } from '../models/workspace';

@Injectable()
export class WorkspaceService {
  readonly path = 'https://amylotool-backend.onrender.com/workspaces';

  constructor(private readonly httpClient: HttpClient) {}

  get(id: number): Observable<Workspace> {
    return this.httpClient.get<Workspace>(`${this.path}/list/${id}`);
  }

  getAll(): Observable<Workspace[]> {
    return this.httpClient.get<Workspace[]>(`${this.path}/list`);
  }
}

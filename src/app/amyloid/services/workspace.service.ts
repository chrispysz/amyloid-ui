import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, tap } from 'rxjs';
import { Workspace } from '../models/workspace';

@Injectable({
  providedIn: 'root',
})
export class WorkspaceService {
  private readonly path = 'http://amylotoolbackend-env.eba-qwm3fz5m.eu-central-1.elasticbeanstalk.com/workspace';

  constructor(private readonly httpClient: HttpClient) {}

  get(id: string): Observable<Workspace> {
    return this.httpClient.get<Workspace>(`${this.path}/list?id=${id}`);
  }

  getAll(): Observable<Workspace[]> {
    return this.httpClient.get<Workspace[]>(`${this.path}/list`);
  }

  add(workspace: Workspace): Observable<Object> {
    return this.httpClient.post(`${this.path}/add`, workspace);
  }

  update(workspace: Workspace): Observable<Object> {
    return this.httpClient.put(`${this.path}/update`, workspace);
  }

  delete(id: string): Observable<Object> {
    return this.httpClient.delete(`${this.path}/delete?id=${id}`);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, tap } from 'rxjs';
import { Workspace } from '../models/workspace';

@Injectable({
  providedIn: 'root'
})
export class WorkspaceService {
  private readonly path = 'https://amylotool-backend.onrender.com/workspace';

  constructor(private readonly httpClient: HttpClient) {}

  get(id: number): Observable<Workspace> {
    return this.httpClient.get<Workspace>(`${this.path}/list/${id}`);
  }

  getAll(): Observable<Workspace[]> {
    return this.httpClient.get<Workspace[]>(`${this.path}/list`);
  }

  add(workspace: Workspace): Observable<Object> {
    return this.httpClient.post(`${this.path}/add`, workspace);
  }
}

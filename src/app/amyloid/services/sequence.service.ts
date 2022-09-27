import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Sequence } from '../models/sequence';

@Injectable({
  providedIn: 'root',
})
export class SequenceService {
  constructor(private readonly httpClient: HttpClient) {}

  private readonly path = 'https://amylotool-backend.onrender.com/sequence';

  get(id: number): Observable<Sequence> {
    return this.httpClient.get<Sequence>(`${this.path}/list/${id}`);
  }

  getAll(): Observable<Sequence[]> {
    return this.httpClient.get<Sequence[]>(`${this.path}/list`);
  }

  add(workspace: Sequence): Observable<Object> {
    return this.httpClient.post(`${this.path}/add`, workspace);
  }
}

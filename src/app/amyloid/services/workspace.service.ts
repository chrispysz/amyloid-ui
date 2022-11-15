import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Observable,
  map,
} from 'rxjs';
import { Workspace } from '../models/workspace';
import {
  Firestore,
  collection,
  doc,
  updateDoc,
  deleteDoc,
  setDoc,
} from '@angular/fire/firestore';
import { ToastrService } from 'ngx-toastr';
import { collectionData, docData } from 'rxfire/firestore';

@Injectable({
  providedIn: 'root',
})
export class WorkspaceService {
  constructor(
    private readonly firestore: Firestore,
    private readonly toastr: ToastrService
  ) {}

  workspacesCollection = collection(this.firestore, 'workspaces');

  add(workspace: Workspace) {
    setDoc(doc(this.firestore, 'workspaces', workspace.id), workspace)
      .then((docRef) => {
        this.toastr.success(`Workspace ${workspace.name} added successfully`);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  update(workspace: Workspace) {
    let docRef = doc(this.firestore, 'workspaces', workspace.id);
    let updatedWorkspace = {
      name: workspace.name,
      sequences: workspace.sequences,
      updated: workspace.updated,
    };
    updateDoc(docRef, updatedWorkspace)
      .then((docRef) => {
        this.toastr.success(`Workspace ${workspace.name} updated successfully`);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  delete(workspace: Workspace) {
    let docRef = doc(this.firestore, 'workspaces', workspace.id);
    deleteDoc(docRef)
      .then((docRef) => {
        this.toastr.success(`Workspace ${workspace.name} deleted successfully`);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  get(id: string): Observable<Workspace> {
    let docRef = doc(this.firestore, 'workspaces/' + id);
    return docData(docRef, { idField: 'id' }).pipe(
      map((w) => ({
        id: w['id'],
        name: w['name'],
        sequences: w['sequences'],
        created: w['created'],
        updated: w['updated'],
      }))
    );
  }

  getAll() {
    return collectionData(this.workspacesCollection, {idField: 'id'}) as Observable<Workspace[]>;
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Workspace } from '../models/workspace';
import {
  Firestore,
  collection,
  doc,
  updateDoc,
  deleteDoc,
  setDoc,
  getDoc,
  getDocs,
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

  async get(id: string): Promise<Workspace> {
    let docRef = doc(this.firestore, 'workspaces/' + id);
    return new Promise((resolve, reject) => {
      getDoc(docRef)
        .then((doc) => {
          if (doc.exists()) {
            let workspace = doc.data() as Workspace;
            workspace.id = doc.id;
            resolve(workspace);
          } else {
            reject('No such document!');
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  async getAll(): Promise<Workspace[]> {
    return new Promise((resolve, reject) => {
      let workspaces: Workspace[] = [];
      getDocs(this.workspacesCollection)
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            let workspace = doc.data() as Workspace;
            workspace.id = doc.id;
            workspaces.push(workspace);
          });

          resolve(workspaces);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
}

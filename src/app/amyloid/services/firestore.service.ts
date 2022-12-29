import { Injectable } from '@angular/core';
import { WorkspaceDbReference } from '../models/workspace-db-reference';
import {
  Firestore,
  collection,
  doc,
  updateDoc,
  deleteDoc,
  setDoc,
  getDoc,
  getDocs,
  serverTimestamp,
  query,
  where,
} from '@angular/fire/firestore';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  constructor(
    private readonly firestore: Firestore,
    private readonly toastr: ToastrService
  ) {}

  workspacesCollection = collection(this.firestore, 'workspaces');

  add(workspace: WorkspaceDbReference) {
    setDoc(doc(this.firestore, 'workspaces', workspace.id), workspace).
    then(()=>{
        this.toastr.success(`Workspace db reference created successfully`);
    }).catch(
      (err) => {
        console.log(err);
        this.toastr.error(`Workspace db reference failed during creation`);
      }
    );
  }

  update(workspace: WorkspaceDbReference) {
    let docRef = doc(this.firestore, 'workspaces', workspace.id);
    let updatedWorkspace = {
      name: workspace.name,
      userId: workspace.userId,
      lastModified: serverTimestamp(),
    };
    updateDoc(docRef, updatedWorkspace).catch((err) => {
      console.log(err);
    });
  }

  delete(id: string) {
    let docRef = doc(this.firestore, 'workspaces', id);
    deleteDoc(docRef).catch((err) => {
      console.log(err);
    });
  }

  async get(id: string): Promise<WorkspaceDbReference> {
    let docRef = doc(this.firestore, 'workspaces/' + id);
    return new Promise((resolve, reject) => {
      getDoc(docRef)
        .then((doc) => {
          if (doc.exists()) {
            let workspace = doc.data() as WorkspaceDbReference;
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

  async getAll(): Promise<WorkspaceDbReference[]> {
    return new Promise((resolve, reject) => {
      let workspaces: WorkspaceDbReference[] = [];
      getDocs(this.workspacesCollection)
        .then((snapshot) => {
          snapshot.forEach((doc) => {
            let workspace = doc.data() as WorkspaceDbReference;
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

  async getUserWorkspaces(id: string): Promise<WorkspaceDbReference[]> {
    return new Promise((resolve, reject) => {
      let workspaces: WorkspaceDbReference[] = [];
      const q = query(
        this.workspacesCollection,
        where('userId', '==', id)
      );
      getDocs(q)
        .then((snapshot) => {
          snapshot.forEach((doc) => {
            let workspace = doc.data() as WorkspaceDbReference;
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

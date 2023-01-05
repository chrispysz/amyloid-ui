import { Injectable } from '@angular/core';
import { Workspace } from '../models/workspace';
import { ToastrService } from 'ngx-toastr';
import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from '@angular/fire/storage';
import { Sequence } from '../models/sequence';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class FileStorageService {
  constructor(
    private readonly toastr: ToastrService,
    private readonly http: HttpClient,
    private readonly auth: AuthService
  ) {}

  storage = getStorage();

  uploadWorkspace(file: Blob, id: string) {
    const storageRef = ref(
      this.storage,
      `workspaces/${this.auth.getUserId()}/${id}`
    );
    const uploadTask = uploadBytesResumable(storageRef, file);
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      },
      (error) => {
        console.log(error);
        this.toastr.error(`Workspace failed during update`);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          console.log('File available at', downloadURL);
        });
        this.toastr.success(`Workspace updated successfully`);
      }
    );
  }

  deleteWorkspace(id: string) {
    const storageRef = ref(
      this.storage,
      `workspaces/${this.auth.getUserId()}/${id}`
    );
    deleteObject(storageRef)
      .then(() => {
        this.toastr.success(`Workspace deleted successfully`);
      })
      .catch((err) => {
        console.log(err);
        this.toastr.error(`Workspace deletion failed`);
      });
  }

  async loadWorkspace(id: string): Promise<Workspace> {
    const storageRef = ref(this.storage, `workspaces/${this.auth.getUserId()}/${id}`);
    const url = await getDownloadURL(storageRef);
    return await new Promise((resolve, reject) => {
      this.http.get(url, { responseType: 'text' }).subscribe(
        (data) => {
          resolve(JSON.parse(data));
        },
        (error) => reject(error)
      );
    });
  }

  getSequencesByPage(
    page: number,
    pageSize: number,
    sequences: Sequence[]
  ): Sequence[] {
    let start = (page - 1) * pageSize;
    let end = page * pageSize;
    return sequences.slice(start, end);
  }
}

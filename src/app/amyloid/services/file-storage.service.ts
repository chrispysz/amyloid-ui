import { Injectable } from '@angular/core';
import { Workspace } from '../models/workspace';
import { ToastrService } from 'ngx-toastr';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from '@angular/fire/storage';
import { Sequence } from '../models/sequence';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class FileStorageService {
  constructor(
    private readonly toastr: ToastrService,
    private readonly http: HttpClient
  ) {}

  storage = getStorage();

  uploadWorkspace(file: Blob, fileId: string) {
    const storageRef = ref(this.storage, `workspaces/${fileId}`);
    const uploadTask = uploadBytesResumable(storageRef, file);
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      },
      (error) => {
        console.log(error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          console.log('File available at', downloadURL);
        });
        this.toastr.success(`Workspace added successfully`);
      }
    );
  }

  async loadWorkspace(id: string): Promise<Workspace> {
    const storageRef = ref(this.storage, `workspaces/${id}`);
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

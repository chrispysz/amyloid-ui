import { Injectable } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private readonly auth: Auth,
    private readonly toastr: ToastrService,
    private readonly router: Router
  ) {}

  logIn(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password)
      .then(() => {
        this.toastr.info('Logged in successfully');
        sessionStorage.setItem('user', JSON.stringify(this.auth.currentUser));
      })
      .catch(() => {
        this.toastr.error('Login failed');
      });
  }

  register(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  logOut() {
    return signOut(this.auth)
      .then(() => {
        this.toastr.info('Logged out successfully');
        sessionStorage.removeItem('user');
        this.router.navigate(['/amyloid/dashboard']);
      })
      .catch(() => {
        this.toastr.error('Logout failed');
      });
  }

  userInSessionStorage(): boolean {
    return JSON.parse(sessionStorage.getItem('user')!) ? true : false;
  }

  loggedIn(): boolean {
    return this.auth.currentUser ? true : false;
  }

  getUserId(): string {
    if (this.userInSessionStorage()) {
      return JSON.parse(sessionStorage.getItem('user')!).uid;
    } else if (this.loggedIn()) {
      return this.auth.currentUser!.uid;
    }
    else {
      return '';
    }
  }
}

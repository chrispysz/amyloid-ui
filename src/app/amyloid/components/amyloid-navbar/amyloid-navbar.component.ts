import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-amyloid-navbar',
  templateUrl: './amyloid-navbar.component.html',
  styleUrls: ['./amyloid-navbar.component.scss'],
})
export class AmyloidNavbarComponent implements OnInit {
  navbarCollapsed = true;

  constructor(private readonly authService: AuthService) {}

  ngOnInit(): void {}

  loggedIn(): boolean {
    return this.authService.userInSessionStorage();
  }

  logOut() {
    this.authService.logOut();
  }
}

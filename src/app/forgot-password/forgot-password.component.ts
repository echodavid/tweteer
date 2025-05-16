import { Component } from '@angular/core';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: false,
  templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent {
  email: String = '';

  constructor(private userService: UserService, private router: Router) {}
  resetPassword() {
    console.log(this.email);

    var myValidUser = this.userService.sendUrlResetPassword(this.email);

    if (myValidUser.id != 0) this.router.navigate(['/']);

    console.log(myValidUser);
  }
}

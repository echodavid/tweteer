import { Component } from '@angular/core';
import { UserService } from '../services/user.service';
import { Credential } from '../models/user/Credential';
import { Router } from '@angular/router';
import { Token } from '../models/user/Token';
import { StorageService } from '../services/storage.service';

@Component({
  selector: 'app-login',
  standalone: false,
  styleUrls: ['./login.component.css'],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  constructor(
    private userService: UserService,
    private storageService: StorageService,
    private router: Router
  ) {}

  email: String = '';
  password: String = '';
  myLogin = new Token();

  callLogin() {
    //alert("login...");

    var myCredential = new Credential();

    myCredential.email = this.email;
    myCredential.password = this.password;

    this.userService.postLogin(myCredential).subscribe(
      (data: any) => {
        this.storageService.setSession('user', myCredential.email);
        this.storageService.setSession(
          'token',
          JSON.parse(JSON.stringify(data)).accessToken
        );
        this.router.navigate(['/home']);
      },
      (error) => {
        myCredential.email = '';
        myCredential.password = '';
        alert(error);
      }
    );

    if (this.myLogin.accessToken != '') this.router.navigate(['/home']);
  }
}

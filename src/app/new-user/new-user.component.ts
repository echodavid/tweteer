import { Component } from '@angular/core';
import { UserService } from '../services/user.service';
import { User } from '../models/user/User';
import { Router } from '@angular/router';

@Component({
  selector: 'app-new-user',
  standalone: false,
  styleUrls: ['./new-user.component.css'],
  templateUrl: './new-user.component.html',
})
export class NewUserComponent {
  constructor(private userService: UserService, private router: Router) {}

  myPayloadUser = new User();
  myNewUser = new User();
// ...existing code...
  createUser() {
    console.log(this.myPayloadUser);

    this.userService.createUser(this.myPayloadUser).subscribe({
      next: (response: any) => {
        console.log(response);
        // Puedes mostrar un mensaje de éxito aquí si quieres
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error(err);
        // Puedes mostrar un mensaje de error aquí si quieres
      }
    });
  }
// ...existing code...
}

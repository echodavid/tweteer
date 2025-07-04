import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { NewUserComponent } from './new-user/new-user.component';
import { HomeComponent } from './home/home.component';
import { TweetComponent } from './tweet/tweet.component';
import { TweetModalComponent } from './tweet-modal/TweetModalComponent';
// import { HomeComponent } from './home/home.component';
// import { LoginComponent } from "./login/login.component";
// import { LandingPageComponent } from "./landing-page/landing-page.component";
// import { ForgotPasswordComponent } from "./forgot-password/forgot-password.component";
// import { NewUserComponent } from "./new-user/new-user.component";
// import { ResetPasswordComponent } from "./reset-password/reset-password.component";

const routes: Routes = [
  // { path: '', component: LandingPageComponent},
  { path: 'home', component: HomeComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'newuser', component: NewUserComponent },
  { path: 'tweet/:id', component: TweetModalComponent, outlet: 'modal' }, // { path: 'reset-password/:email/:token', component: ResetPasswordComponent },
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

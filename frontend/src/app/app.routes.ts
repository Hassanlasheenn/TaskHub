import { Routes } from '@angular/router';
import { LoginComponent, RegisterComponent } from './auth/components';

export const routes: Routes = [
    { path: '', component: RegisterComponent },
    { path: 'login', component: LoginComponent },
];

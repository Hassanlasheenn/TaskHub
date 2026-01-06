import { Routes } from '@angular/router';
import { LoginComponent, RegisterComponent } from './auth/components';
import { DashboardComponent, ProfileComponent } from './layouts/components';
import { authGuard } from './auth/guards';
import { NotFoundComponent } from './shared/components';
import { AuthPaths } from './auth/enums';
import { LayoutPaths } from './layouts/enums';

export const routes: Routes = [
    { path: '', component: RegisterComponent },
    { path: AuthPaths.LOGIN, component: LoginComponent },
    { path: LayoutPaths.DASHBOARD, component: DashboardComponent, canActivate: [authGuard] },
    { path: LayoutPaths.PROFILE, component: ProfileComponent, canActivate: [authGuard] },
    { path: AuthPaths.NOT_FOUND, component: NotFoundComponent },
    { path: '**', redirectTo: AuthPaths.NOT_FOUND },
];

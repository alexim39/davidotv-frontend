import { Routes } from "@angular/router";
import { ForgotPasswordComponent } from "./password-mgt/forgot-password.component";
import { ResetPasswordComponent } from "./password-mgt/reset-password.component";


export const AuthRoutes: Routes = [
    {
        path: '',
        redirectTo: 'forgot-password',
        pathMatch: 'full'
    },
    {
        path: 'forgot-password',
        component: ForgotPasswordComponent,
        title: "Forgot Password - Request password change",
    },
    {
        path: 'reset-password',
        component: ResetPasswordComponent,
        title: "Reset Password - Rest account passowrd",
    },
];
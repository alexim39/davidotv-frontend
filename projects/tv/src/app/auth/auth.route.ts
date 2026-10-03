import { Routes } from "@angular/router";
import { ForgotPasswordComponent } from "./password-mgt/forgot-password.component";
import { ResetPasswordComponent } from "./password-mgt/reset-password.component";
import { SigninComponent } from "../features/auth/signin/signin.component";
import { SignupComponent } from "../features/auth/signup/signup.component";


export const AuthRoutes: Routes = [
    // FIX: '' used to redirect to 'forgot-password' (no sign-in page existed),
    // so every 401/guard redirect to /auth landed users on password recovery —
    // including on cold boot when Navbar's session check 401s. /auth is now
    // the sign-in page; the dialog flow (authDialog) is untouched.
    {
        path: '',
        component: SigninComponent,
        title: "Sign in - DavidoTV",
    },
    {
        path: 'signup',
        component: SignupComponent,
        title: "Create account - DavidoTV",
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

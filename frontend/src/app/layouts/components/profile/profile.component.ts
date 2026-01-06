import { Component, OnInit } from "@angular/core";
import { AuthService } from "../../../auth/services/auth.service";
import { CommonModule } from "@angular/common";
import { IUserResponse } from "../../../auth/interfaces";

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss'],
    standalone: true,
    imports: [CommonModule],
})
export class ProfileComponent implements OnInit {
    userData: IUserResponse | null = null;

    constructor(
        private readonly _authService: AuthService
    ) {}

    ngOnInit(): void {
        this.userData = this._authService.getCurrentUserData();
        console.log(this.userData);
    }
}
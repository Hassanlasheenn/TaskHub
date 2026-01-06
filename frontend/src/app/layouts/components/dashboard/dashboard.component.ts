import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { AuthService } from "../../../auth/services";

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    standalone: true,
    imports: [CommonModule],
})
export class DashboardComponent implements OnInit {
    userData: any;
    
    constructor(
        private readonly _authService: AuthService
    ) {}

    ngOnInit(): void {
        this.userData = this._authService.getCurrentUserData();
        console.log(this.userData);
    }
}
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, take } from "rxjs";
import { API_URLS } from "../../api.global";

@Injectable({
    providedIn: 'root',
})
export class UserService {

    constructor(
        private readonly _http: HttpClient,
    ) {}

    getUserById(userId: number): Observable<any> {
        return this._http
        .get<any>(`${API_URLS.user.getUserById}/${userId}`)
        .pipe(take(1));
    }
}
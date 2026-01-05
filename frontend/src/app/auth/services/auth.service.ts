import { Injectable } from "@angular/core";
import { ENDPOINT_URLS } from "../../api.global";
import { HttpClient } from "@angular/common/http";
import { Observable, take } from "rxjs";

const AUTH_URL = ENDPOINT_URLS.auth;

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    constructor(
        private readonly _http: HttpClient,
    ) {}

    registerUser(payload: any): Observable<any> {
        return this._http
        .post<any>(AUTH_URL.register, payload)
        .pipe(take(1));
    }

    loginUser(payload: any): Observable<any> {
        return this._http
        .post<any>(AUTH_URL.login, payload)
        .pipe(take(1));
    }
}
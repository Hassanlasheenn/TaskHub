import { Injectable } from "@angular/core";
import { API_URLS } from "../../api.global";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Observable, take } from "rxjs";
import { ILoginPayload, ILoginResponse, IRegisterPayload, IRegisterResponse } from "../interfaces";

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private readonly oauth2Headers = new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded'
    });

    constructor(
        private readonly _http: HttpClient,
    ) {}

    registerUser(payload: IRegisterPayload): Observable<IRegisterResponse> {
        return this._http
        .post<IRegisterResponse>(API_URLS.auth.register, payload)
        .pipe(take(1));
    }

    loginUser(payload: ILoginPayload): Observable<ILoginResponse> {
        const body = new HttpParams()
            .set('username', payload.email)
            .set('password', payload.password)
            .set('grant_type', 'password');

        return this._http
        .post<ILoginResponse>(
            API_URLS.auth.login, 
            body.toString(), 
            { headers: this.oauth2Headers }
        )
        .pipe(take(1));
    }
}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { API_BASE_URL } from '../../api.global';
import { AuthService } from '../../auth/services/auth.service';

@Injectable({ providedIn: 'root' })
export class ImageUploadService {
    private readonly _endpoint = `${API_BASE_URL}/todos/upload-image`;

    constructor(
        private readonly _http: HttpClient,
        private readonly _authService: AuthService
    ) {}

    uploadImage(file: File): Observable<string> {
        const userId = this._authService.getCurrentUserId();
        if (!userId) {
            return throwError(() => new Error('User not authenticated'));
        }

        const formData = new FormData();
        formData.append('file', file, file.name || 'pasted-image.png');

        return this._http.post<{ url: string }>(
            `${this._endpoint}?user_id=${userId}`,
            formData,
            { withCredentials: true }
        ).pipe(
            take(1),
            map(r => r.url)
        );
    }
}

import { environment } from '../environments/environment';

export const API_BASE_URL = environment.apiBaseUrl;

export const ENDPOINT_URLS = {
    auth: {
        register: '/register',
        login: '/login',
    },
};


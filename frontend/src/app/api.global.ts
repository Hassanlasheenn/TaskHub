import { environment } from '../environments/environment';

export const API_BASE_URL = environment.apiBaseUrl;

export const ENDPOINT_URLS = {
    auth: {
        register: '/register',
        login: '/login',
    },
};

export const API_URLS = {
    auth: {
        register: `${API_BASE_URL}${ENDPOINT_URLS.auth.register}`,
        login: `${API_BASE_URL}${ENDPOINT_URLS.auth.login}`,
    },
};
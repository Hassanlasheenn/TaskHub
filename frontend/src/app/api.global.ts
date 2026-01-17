import { environment } from '../environments/environment';

export const API_BASE_URL = environment.apiBaseUrl;

export const API_URLS = {
    auth: {
        register: `${API_BASE_URL}/register`,
        login: `${API_BASE_URL}/login`,
        logout: `${API_BASE_URL}/logout`,
    },
           user: {
               getUserById: `${API_BASE_URL}/users`,
               updateUser: `${API_BASE_URL}/users`,
               getUsersWithRoleUser: `${API_BASE_URL}/users/role/user`,
           },
    admin: {
        listUsers: `${API_BASE_URL}/admin/users`,
        listUsersWithTodos: `${API_BASE_URL}/admin/users-with-todos`,
        deleteUser: `${API_BASE_URL}/admin/users`,
        updateUserRole: `${API_BASE_URL}/admin/users`,
    },
};
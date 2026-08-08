import { apiClient } from "@/lib/api/client";

class AuthClientService {

    async heartbeat() {

        return apiClient.post(
            "/api/auth/heartbeat"
        );

    }

}

export const authClientService =
    new AuthClientService();
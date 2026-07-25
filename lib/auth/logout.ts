import { authService } from "@/services/auth.service";

export async function logout() {
  await authService.logout();

  window.location.href = "/login";
}
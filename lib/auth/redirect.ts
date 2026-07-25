export function getDashboard(
  role: string
) {
  switch (role) {
    case "ADMIN":
      return "/admin/dashboard";

    case "TEACHER":
      return "/teacher/dashboard";

    default:
      return "/dashboard";
  }
}
import {
  adminRepository,
  CreateAdminDto,
  UpdateAdminDto,
} from "@/repositories/admin.repository";

export class AdminService {
  getAll() {
    return adminRepository.getAll();
  }

  getById(id: string) {
    return adminRepository.getById(id);
  }

  create(data: CreateAdminDto) {
    return adminRepository.create(data);
  }

  update(id: string, data: UpdateAdminDto) {
    return adminRepository.update(id, data);
  }

  delete(id: string) {
    return adminRepository.delete(id);
  }

  activate(id: string) {
    return adminRepository.activate(id);
  }

  deactivate(id: string) {
    return adminRepository.deactivate(id);
  }
}

export const adminService = new AdminService();
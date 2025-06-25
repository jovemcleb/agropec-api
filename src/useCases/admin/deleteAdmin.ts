import { AdminRepository } from "../../repositories/AdminRepository";
interface IRequester {
  uuid: string;
  role: string;
}
export async function deleteAdmin(
  requester: IRequester,
  uuidParam: string,
  adminRepository: AdminRepository
) {
  const adminToDelete = await adminRepository.findByUuid(uuidParam);

  if (!adminToDelete) {
    throw new Error("Admin not found to delete");
  }

  if (adminToDelete.role === "SUPER_ADMIN") {
    throw new Error("Permission denied: Cannot delete a super administrator.");
  }

  if (adminToDelete.role === "admin" && requester.role !== "SUPER_ADMIN") {
    throw new Error(
      "Permission denied: Only a super administrator can delete other admins."
    );
  }

  return adminRepository.delete(uuidParam);
}

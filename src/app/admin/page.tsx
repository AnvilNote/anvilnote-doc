import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/feedback/admin-auth";
import { listAllFeedbackForAdmin } from "@/lib/feedback/list-feedback";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const items = await listAllFeedbackForAdmin();

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <AdminDashboard items={items} />
    </main>
  );
}

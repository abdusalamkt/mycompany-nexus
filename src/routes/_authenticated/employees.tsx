import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/portal/ModulePlaceholder";

export const Route = createFileRoute("/_authenticated/employees")({
  head: () => ({
    meta: [
      { title: "Staff List | Internal Company Portal" },
      { name: "description", content: "Employee records, passports, visas and document status." },
      { name: "robots", content: "noindex, nofollow, noarchive" },
      { property: "og:title", content: "Staff List | Internal Company Portal" },
      { property: "og:description", content: "Employee records, passports, visas and document status." },
    ],
  }),
  component: EmployeesPage,
});

function EmployeesPage() {
  return (
    <ModulePlaceholder
      title="Staff List"
      description="Employee records, passports, visas and document status."
      permission="employees.view"
      note="This module is scheduled in the next delivery phase and already has its permissions and access rules in place."
    />
  );
}

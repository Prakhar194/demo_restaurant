import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import LoginForm from "@/components/LoginForm";

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  return <LoginForm />;
}

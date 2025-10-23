import AuthLayout from "@/components/AuthLayout";
import { RegistrationForm } from "@/components/RegistrationForm";

export default function Home() {
  return (
    <AuthLayout>
      <RegistrationForm />
    </AuthLayout>
  );
}

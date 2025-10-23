import { RegistrationForm } from '@/components/RegistrationForm';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] py-10">
      <div className="container mx-auto flex justify-center px-4">
        <RegistrationForm />
      </div>
    </main>
  );
}

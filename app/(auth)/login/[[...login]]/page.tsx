import Image from 'next/image';
import { SignIn } from '@clerk/nextjs';
import { neobrutalism } from '@clerk/themes';

export default function LoginPage() {
  return (
    <main className="flex flex-col items-center justify-center p-5 gap-10 animate-fade-in h-full">
      <Image src="/assets/logo.svg" width={100} height={100} alt="Logo" />

      <div className="mt-3">
        <SignIn appearance={{
          baseTheme: neobrutalism,
        }} />
      </div>
    </main>
  );
}

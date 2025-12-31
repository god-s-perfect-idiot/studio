import ActionBoard from '@/components/action-board';

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 pt-8 sm:p-8">
      <ActionBoard />
    </main>
  );
}

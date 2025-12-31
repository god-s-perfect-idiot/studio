import ActionBoard from '@/components/action-board';

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary-foreground drop-shadow-md">
          Action Board
        </h1>
        <p className="text-lg md:text-xl text-primary-foreground/80 mt-2">
          Complete your tasks to launch the celebration.
        </p>
      </div>
      <ActionBoard />
    </main>
  );
}

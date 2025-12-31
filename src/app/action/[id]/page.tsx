'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CardContent } from '@/components/ui/card';

export default function ActionPage() {
  const params = useParams();
  const taskId = params.id;

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 pt-8 sm:p-8">
      <div className="w-full max-w-md">
        <Card className="bg-white">
          <CardContent className="h-64"></CardContent>
        </Card>
        <div className="mt-4 flex justify-end">
            <Link href={`/?completed_task=${taskId}`}>
                <Button>Complete Action</Button>
            </Link>
        </div>
      </div>
    </main>
  );
}
'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Check, Play } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import Confetti from '@/components/confetti';
import Link from 'next/link';

type TaskType = 'checkbox' | 'play';
type ActionType = 'toggle' | 'simple_action';

type Task = {
  id: number;
  icon: string;
  title: string;
  label: string;
  type: TaskType;
  action: ActionType;
  completed: boolean;
};

const initialTasks: Task[] = [
  { id: 1, icon: '🚀', title: 'To-Do', label: 'check 1', type: 'checkbox', action: 'toggle', completed: false },
  { id: 2, icon: '🌟', title: 'Text Entry', label: 'play 2', type: 'play', action: 'simple_action', completed: false },
  { id: 3, icon: '💡', title: 'Text Entry', label: 'play 1', type: 'play', action: 'simple_action', completed: false },
  { id: 4, icon: '💖', title: 'To-Do', label: 'check 2', type: 'checkbox', action: 'toggle', completed: false },
];

const getInitialTasks = (): Task[] => {
  if (typeof window === 'undefined') {
    return initialTasks;
  }
  const savedTasks = localStorage.getItem('tasks');
  return savedTasks ? JSON.parse(savedTasks) : initialTasks;
};


export default function ActionBoard() {
  const [tasks, setTasks] = useState<Task[]>(getInitialTasks);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleTaskStateChange = (newTasks: Task[]) => {
    setTasks(newTasks);
  };

  const handleTaskCompletionFromActionPage = useCallback((taskId: number) => {
    handleTaskStateChange(
        getInitialTasks().map((t) => (t.id === taskId ? { ...t, completed: true } : t))
    );
  }, []);

  useEffect(() => {
    const completedTaskId = searchParams.get('completed_task');
    if (completedTaskId) {
      handleTaskCompletionFromActionPage(Number(completedTaskId));
      const newUrl = window.location.pathname;
      router.replace(newUrl, { scroll: false });
    }
  }, [searchParams, router, handleTaskCompletionFromActionPage]);


  const progress = useMemo(() => {
    const completedCount = tasks.filter((t) => t.completed).length;
    return (completedCount / tasks.length) * 100;
  }, [tasks]);
  
  const allTasksCompleted = useMemo(() => tasks.every(t => t.completed), [tasks]);

  useEffect(() => {
    if (allTasksCompleted) {
      setShowConfetti(true);
    } else {
      setShowConfetti(false);
    }
  }, [allTasksCompleted]);
  
  const handleTaskCompletion = (taskId: number) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    handleTaskStateChange(
        tasks.map((t) => (t.id === taskId ? { ...t, completed: true } : t))
    );
  };

  const handleCheckboxClick = (taskId: number) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.completed) return;
    handleTaskCompletion(taskId);
  };

  const handleReset = () => {
    // We need to create a new array with new objects to ensure the state update is detected
    const resetTasks = initialTasks.map(task => ({ ...task, completed: false }));
    localStorage.setItem('tasks', JSON.stringify(resetTasks));
    setTasks(resetTasks);
    setShowConfetti(false);
  };

  const renderTaskControl = (task: Task) => {
    const isCompleted = task.completed;
    const iconColor = isCompleted ? 'text-accent' : 'text-primary';
    const borderColor = isCompleted ? 'border-accent' : 'border-primary';

    if (task.type === 'checkbox') {
      return (
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleCheckboxClick(task.id)}
          className={cn(
            'h-10 w-10 rounded-lg border-[3px] flex-shrink-0 bg-white hover:bg-white',
            borderColor,
            isCompleted && 'bg-accent/10 hover:bg-accent/20'
          )}
          aria-label={`Mark task '${task.label}' as complete`}
        >
          <Check className={cn('h-6 w-6 stroke-[3]', iconColor)} />
        </Button>
      );
    }

    const control = (
       <Button
        variant="outline"
        size="icon"
        disabled={isCompleted}
        className={cn('h-10 w-10 rounded-full border-[3px] flex-shrink-0 bg-white hover:bg-white', borderColor, isCompleted && 'border-accent bg-accent/10 hover:bg-accent/20')}
        aria-label={`Execute task '${task.label}'`}
      >
        {isCompleted ? (
          <Check className={cn('h-6 w-6 stroke-[3]', iconColor)} />
        ) : (
          <Play className={cn('h-6 w-6 stroke-[3]', iconColor, 'ml-1')} />
        )}
      </Button>
    )

    if(isCompleted) {
        return control;
    }

    return (
        <Link href={`/action/${task.id}`}>
            {control}
        </Link>
    )
  };

  return (
    <div className="w-full max-w-md">
       {showConfetti && <Confetti />}
       <div className="w-full max-w-md mb-4 px-2">
        <Progress value={progress} className="h-2 [&>div]:bg-accent bg-white" />
      </div>
      <div className="space-y-3">
        {tasks.map((task) => (
          <Card
            key={task.id}
            className={cn(
              'flex items-center p-4 transition-all duration-300 shadow-md hover:shadow-lg w-full rounded-2xl bg-card border-2',
              task.completed ? 'border-accent' : 'border-transparent'
            )}
          >
            <div className="text-3xl mr-4 flex-shrink-0">{task.icon}</div>
            <div className="flex-grow">
              <div className="text-sm text-muted-foreground">{task.title}</div>
              <div className="text-lg font-bold">{task.label}</div>
            </div>
            {renderTaskControl(task)}
          </Card>
        ))}
      </div>
      <div className="mt-8 flex w-full flex-col items-center gap-6">
        <Button onClick={handleReset} variant="default" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-lg text-lg">
          Reset Routine
        </Button>
      </div>
    </div>
  );
}

'use client';

import { useState, useMemo, useTransition } from 'react';
import { prioritizeTasksAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import Confetti from '@/components/confetti';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Check, LoaderCircle, Play, WandSparkles } from 'lucide-react';
import type { PrioritizedTasksOutput } from '@/ai/flows/dynamically-prioritize-tasks';

type TaskType = 'checkbox' | 'play';
type ActionType = 'toggle' | 'ai_prioritize' | 'simple_action';

type Task = {
  id: number;
  label: string;
  type: TaskType;
  action: ActionType;
  completed: boolean;
};

const initialTasks: Task[] = [
  { id: 1, label: 'Review project requirements', type: 'checkbox', action: 'toggle', completed: false },
  { id: 2, label: 'Set up development environment', type: 'checkbox', action: 'toggle', completed: false },
  { id: 3, label: 'Dynamically prioritize backlog', type: 'play', action: 'ai_prioritize', completed: false },
  { id: 4, label: 'Initiate final review', type: 'play', action: 'simple_action', completed: false },
];

export default function ActionBoard() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [aiResult, setAiResult] = useState<PrioritizedTasksOutput | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const allTasksComplete = useMemo(() => tasks.every((task) => task.completed), [tasks]);

  const handleAiPrioritize = () => {
    const uncompletedTasks = tasks
      .filter((task) => !task.completed && task.action !== 'ai_prioritize')
      .map((task) => task.label);

    if (uncompletedTasks.length === 0) {
      toast({
        title: 'No tasks to prioritize',
        description: 'All other tasks are already complete.',
      });
      setTasks((prevTasks) =>
        prevTasks.map((t) => (t.action === 'ai_prioritize' ? { ...t, completed: true } : t))
      );
      return;
    }

    startTransition(async () => {
      try {
        const result = await prioritizeTasksAction({ taskList: uncompletedTasks });
        setAiResult(result);
        setIsAlertOpen(true);
        setTasks((prevTasks) =>
          prevTasks.map((t) => (t.action === 'ai_prioritize' ? { ...t, completed: true } : t))
        );
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Prioritization Failed',
          description: error instanceof Error ? error.message : 'An unknown error occurred.',
        });
        // Also un-complete the AI task if it fails
        setTasks((prevTasks) =>
          prevTasks.map((t) => (t.action === 'ai_prioritize' ? { ...t, completed: false } : t))
        );
      }
    });
  };

  const handleTaskClick = (taskId: number) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.completed) return;

    if (task.action === 'ai_prioritize') {
      handleAiPrioritize();
    } else {
      setTasks((prevTasks) =>
        prevTasks.map((t) => (t.id === taskId ? { ...t, completed: true } : t))
      );
    }
  };

  const renderTaskControl = (task: Task) => {
    const isAiTask = task.action === 'ai_prioritize';
    const isCompleted = task.completed;
    const isLoading = isPending && isAiTask;

    const iconColor = isCompleted ? 'text-green-500' : 'text-primary';

    if (task.type === 'checkbox') {
      return (
        <Checkbox
          id={`task-${task.id}`}
          checked={isCompleted}
          onCheckedChange={() => handleTaskClick(task.id)}
          className={cn(
            'h-6 w-6 rounded-md border-2 data-[state=checked]:bg-transparent data-[state=checked]:border-green-500',
            isCompleted ? 'border-green-500' : 'border-primary'
          )}
          aria-label={`Mark task '${task.label}' as complete`}
        >
          <Checkbox.Indicator>
            <Check className={cn('h-5 w-5', iconColor)} />
          </Checkbox.Indicator>
        </Checkbox>
      );
    }

    return (
      <Button
        variant="outline"
        size="icon"
        onClick={() => handleTaskClick(task.id)}
        disabled={isLoading || isCompleted}
        className={cn('h-10 w-10 rounded-full border-2', isCompleted && 'border-green-500 bg-green-500/10')}
        aria-label={`Execute task '${task.label}'`}
      >
        {isLoading ? (
          <LoaderCircle className="h-5 w-5 animate-spin" />
        ) : isCompleted ? (
          <Check className={cn('h-5 w-5', iconColor)} />
        ) : isAiTask ? (
          <WandSparkles className={cn('h-5 w-5', iconColor)} />
        ) : (
          <Play className={cn('h-5 w-5', iconColor)} />
        )}
      </Button>
    );
  };

  return (
    <>
      {allTasksComplete && <Confetti />}
      <div className="w-full max-w-md space-y-4">
        {tasks.map((task) => (
          <Card
            key={task.id}
            className={cn(
              'flex items-center justify-between p-4 transition-all duration-300 shadow-lg hover:shadow-xl',
              task.completed && 'border-green-400 ring-2 ring-green-400'
            )}
          >
            <label
              htmlFor={`task-${task.id}`}
              className={cn(
                'flex-grow text-base md:text-lg pl-4 font-medium cursor-pointer',
                task.completed && 'line-through text-muted-foreground'
              )}
            >
              {task.label}
            </label>
            {renderTaskControl(task)}
          </Card>
        ))}
        {allTasksComplete && (
          <div className="text-center p-6 bg-card rounded-lg shadow-inner">
            <h2 className="text-2xl font-bold text-green-500">Job Complete!</h2>
            <p className="text-card-foreground/80 mt-1">Great work, time to celebrate!</p>
          </div>
        )}
      </div>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <WandSparkles className="text-accent" />
              AI Task Prioritization Complete
            </AlertDialogTitle>
            <AlertDialogDescription>
              {aiResult?.reasoning}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="max-h-60 overflow-y-auto pr-2">
            <ul className="space-y-2 list-decimal list-inside text-sm">
              {aiResult?.prioritizedTasks.map((task, index) => (
                <li key={index} className="font-medium">{task}</li>
              ))}
            </ul>
          </div>
          <AlertDialogFooter>
            <AlertDialogAction>Got it!</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

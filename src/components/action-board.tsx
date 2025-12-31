'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import Confetti from '@/components/confetti';
import { cn } from '@/lib/utils';
import { Check, Play } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

type TaskType = 'checkbox' | 'play';
type ActionType = 'toggle' | 'simple_action';

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
  { id: 4, label: 'Initiate final review', type: 'play', action: 'simple_action', completed: false },
];

export default function ActionBoard() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const allTasksComplete = useMemo(() => tasks.every((task) => task.completed), [tasks]);

  const progress = useMemo(() => {
    const completedCount = tasks.filter((t) => t.completed).length;
    return (completedCount / tasks.length) * 100;
  }, [tasks]);

  const handleTaskClick = (taskId: number) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.completed) return;

    setTasks((prevTasks) =>
      prevTasks.map((t) => (t.id === taskId ? { ...t, completed: true } : t))
    );
  };

  const renderTaskControl = (task: Task) => {
    const isCompleted = task.completed;
    const iconColor = isCompleted ? 'text-accent' : 'text-primary';

    if (task.type === 'checkbox') {
      return (
        <Checkbox
          id={`task-${task.id}`}
          checked={isCompleted}
          onCheckedChange={() => handleTaskClick(task.id)}
          className={cn(
            'h-6 w-6 rounded-md border-2 data-[state=checked]:bg-transparent data-[state=checked]:border-accent',
            isCompleted ? 'border-accent' : 'border-primary'
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
        disabled={isCompleted}
        className={cn('h-10 w-10 rounded-full border-2', isCompleted && 'border-accent bg-accent/10')}
        aria-label={`Execute task '${task.label}'`}
      >
        {isCompleted ? (
          <Check className={cn('h-5 w-5', iconColor)} />
        ) : (
          <Play className={cn('h-5 w-5', iconColor)} />
        )}
      </Button>
    );
  };

  return (
    <>
      {allTasksComplete && <Confetti />}
      <div className="w-full max-w-md mb-4">
        <Progress value={progress} className="[&>div]:bg-accent" />
      </div>
      {tasks.map((task) => (
        <Card
          key={task.id}
          className={cn(
            'flex items-center justify-between p-4 transition-all duration-300 shadow-lg hover:shadow-xl w-full max-w-md mb-4',
            task.completed && 'border-accent ring-2 ring-accent'
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
    </>
  );
}

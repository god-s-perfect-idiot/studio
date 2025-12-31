'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Check, Play } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import Confetti from '@/components/confetti';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from "@/components/ui/label";


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
  { id: 1, icon: '🎉', title: 'To-Do', label: 'check 1', type: 'checkbox', action: 'toggle', completed: false },
  { id: 2, icon: '👍', title: 'Text Entry', label: 'play 2', type: 'play', action: 'simple_action', completed: false },
  { id: 3, icon: '🙌', title: 'Text Entry', label: 'play 1', type: 'play', action: 'simple_action', completed: false },
  { id: 4, icon: '✅', title: 'To-Do', label: 'check 2', type: 'checkbox', action: 'toggle', completed: false },
];

const audioFiles: string[] = [];

const ActionView = ({ onComplete }: { onComplete: () => void }) => (
  <div className="w-full max-w-md">
    <Card className="bg-white">
      <div className="h-64 p-6"></div>
    </Card>
    <div className="mt-4 flex justify-end">
      <Button onClick={onComplete}>Complete Action</Button>
    </div>
  </div>
);

export default function ActionBoard() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [showConfetti, setShowConfetti] = useState(false);
  const [activeView, setActiveView] = useState<'board' | 'action'>('board');
  const [currentActionTaskId, setCurrentActionTaskId] = useState<number | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const savedTasks = localStorage.getItem('tasks');
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      }
    } catch (error) {
      console.error("Failed to parse tasks from localStorage", error);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }
  }, [tasks, isMounted]);

  const handleTaskStateChange = (newTasks: Task[]) => {
    setTasks(newTasks);
  };

  const handleTaskCompletion = (taskId: number) => {
    handleTaskStateChange(
      tasks.map((t) => (t.id === taskId ? { ...t, completed: true } : t))
    );
  };

  const handleActionComplete = () => {
    if (currentActionTaskId) {
      handleTaskCompletion(currentActionTaskId);
    }
    setCurrentActionTaskId(null);
    setActiveView('board');
  };

  const progress = useMemo(() => {
    if (!isMounted) return 0;
    const completedCount = tasks.filter((t) => t.completed).length;
    return (completedCount / tasks.length) * 100;
  }, [tasks, isMounted]);

  const allTasksCompleted = useMemo(() => isMounted && tasks.every(t => t.completed), [tasks, isMounted]);

  useEffect(() => {
    if (allTasksCompleted) {
      setShowConfetti(true);
    } else {
      setShowConfetti(false);
    }
  }, [allTasksCompleted]);

  const handleCheckboxClick = (taskId: number) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.completed) return;
    handleTaskCompletion(taskId);
  };

  const handlePlayClick = (taskId: number) => {
    setCurrentActionTaskId(taskId);
    setActiveView('action');
  };

  const handleReset = () => {
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
            'h-10 w-10 rounded-lg border-[3px] flex-shrink-0 bg-white hover:bg-primary/20',
            borderColor
          )}
          aria-label={`Mark task '${task.label}' as complete`}
        >
          <Check className={cn('h-6 w-6 stroke-[3]', iconColor)} />
        </Button>
      );
    }

    return (
      <Button
        variant="outline"
        size="icon"
        disabled={isCompleted}
        onClick={() => !isCompleted && handlePlayClick(task.id)}
        className={cn(
          'h-10 w-10 rounded-full border-[3px] flex-shrink-0 bg-white hover:bg-primary/20',
          borderColor,
          isCompleted && 'border-accent bg-accent/10'
        )}
        aria-label={`Execute task '${task.label}'`}
      >
        {isCompleted ? (
          <Check className={cn('h-6 w-6 stroke-[3]', iconColor)} />
        ) : (
          <Play className={cn('h-6 w-6 stroke-[3]', iconColor, 'ml-1')} />
        )}
      </Button>
    )
  };
  
  if (!isMounted) {
    return null;
  }

  if (activeView === 'action') {
    return <ActionView onComplete={handleActionComplete} />;
  }

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
              <div className="text-sm text-gray-600">{task.title}</div>
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
        <div className="w-full max-w-md space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="checkbox-sound">Checkbox sound effect</Label>
              <Select>
                <SelectTrigger id="checkbox-sound" className="w-full bg-white">
                  <SelectValue placeholder="Select a sound" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Checkbox Sounds</SelectLabel>
                    {audioFiles.map((file) => (
                      <SelectItem key={file} value={file}>
                        {file}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="play-sound">Play button sound effect</Label>
              <Select>
                <SelectTrigger id="play-sound" className="w-full bg-white">
                  <SelectValue placeholder="Select a sound" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Play Button Sounds</SelectLabel>
                    {audioFiles.map((file) => (
                      <SelectItem key={file} value={file}>
                        {file}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="celebration-sound">Routine celebration sound effect</Label>
              <Select>
                <SelectTrigger id="celebration-sound" className="w-full bg-white">
                  <SelectValue placeholder="Select a sound" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Celebration Sounds</SelectLabel>
                    {audioFiles.map((file) => (
                      <SelectItem key={file} value={file}>
                        {file}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
        </div>
      </div>
    </div>
  );
}

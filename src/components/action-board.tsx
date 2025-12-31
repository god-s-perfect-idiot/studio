'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Check, Play } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import Confetti from '@/components/confetti';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

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
  { id: 2, icon: '📝', title: 'Text Entry', label: 'play 2', type: 'play', action: 'simple_action', completed: false },
  { id: 3, icon: '🎨', title: 'Text Entry', label: 'play 1', type: 'play', action: 'simple_action', completed: false },
  { id: 4, icon: '🌟', title: 'To-Do', label: 'check 2', type: 'checkbox', action: 'toggle', completed: false },
];

const soundOptions = [
    { value: '/mp3s/bell.mp3', label: 'Bell' },
    { value: '/mp3s/click.mp3', label: 'Click' },
    { value: '/mp3s/chime.mp3', label: 'Chime' },
    { value: '/mp3s/ding.mp3', label: 'Ding' },
    { value: '/mp3s/success.mp3', label: 'Success' },
    { value: '/mp3s/fanfare.mp3', label: 'Fanfare' },
];

export default function ActionBoard() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [showConfetti, setShowConfetti] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  
  const [checkboxSound, setCheckboxSound] = useState(soundOptions[1].value);
  const [playSound, setPlaySound] = useState(soundOptions[0].value);
  const [celebrationSound, setCelebrationSound] = useState(soundOptions[5].value);

  useEffect(() => {
    setAudio(new Audio());
  }, []);

  const playSoundEffect = useCallback((soundUrl: string) => {
    if (audio && soundUrl) {
      audio.src = soundUrl;
      audio.play().catch(error => console.error("Audio play failed:", error));
    }
  }, [audio]);

  const progress = useMemo(() => {
    const completedCount = tasks.filter((t) => t.completed).length;
    return (completedCount / tasks.length) * 100;
  }, [tasks]);
  
  const allTasksCompleted = useMemo(() => tasks.every(t => t.completed), [tasks]);

  useEffect(() => {
    if (allTasksCompleted) {
      setShowConfetti(true);
      playSoundEffect(celebrationSound);
    } else {
      setShowConfetti(false);
    }
  }, [allTasksCompleted, celebrationSound, playSoundEffect]);

  const handleTaskClick = (taskId: number) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.completed) return;

    if (task.type === 'checkbox') {
        playSoundEffect(checkboxSound);
    } else if (task.type === 'play') {
        playSoundEffect(playSound);
    }

    setTasks((prevTasks) =>
      prevTasks.map((t) => (t.id === taskId ? { ...t, completed: true } : t))
    );
  };

  const handleReset = () => {
    setTasks(initialTasks.map(task => ({ ...task, completed: false })));
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
          onClick={() => handleTaskClick(task.id)}
          className={cn(
            'h-10 w-10 rounded-lg border-[3px] flex-shrink-0 bg-white hover:bg-primary/10',
            borderColor,
            isCompleted && 'bg-accent/10 hover:bg-accent/20'
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
        onClick={() => handleTaskClick(task.id)}
        disabled={isCompleted}
        className={cn('h-10 w-10 rounded-full border-[3px] flex-shrink-0 bg-white hover:bg-primary/10', borderColor, isCompleted && 'border-accent bg-accent/10 hover:bg-accent/20')}
        aria-label={`Execute task '${task.label}'`}
      >
        {isCompleted ? (
          <Check className={cn('h-6 w-6 stroke-[3]', iconColor)} />
        ) : (
          <Play className={cn('h-6 w-6 stroke-[3]', iconColor, 'ml-1')} />
        )}
      </Button>
    );
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

        <div className="w-full space-y-4">
          <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="checkbox-sound">Checkbox sound effect</Label>
              <Select value={checkboxSound} onValueChange={setCheckboxSound}>
                  <SelectTrigger id="checkbox-sound">
                      <SelectValue placeholder="Select a sound" />
                  </SelectTrigger>
                  <SelectContent>
                      {soundOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                  </SelectContent>
              </Select>
          </div>
          <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="play-sound">Play button sound effect</Label>
              <Select value={playSound} onValuechange={setPlaySound}>
                  <SelectTrigger id="play-sound">
                      <SelectValue placeholder="Select a sound" />
                  </SelectTrigger>
                  <SelectContent>
                      {soundOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                  </SelectContent>
              </Select>
          </div>
          <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="celebration-sound">Routine celebration sound effect</Label>
              <Select value={celebrationSound} onValueChange={setCelebrationSound}>
                  <SelectTrigger id="celebration-sound">
                      <SelectValue placeholder="Select a sound" />
                  </SelectTrigger>
                  <SelectContent>
                      {soundOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                  </SelectContent>
              </Select>
          </div>
        </div>
      </div>
    </div>
  );
}

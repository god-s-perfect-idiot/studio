'use server';

import {
  dynamicallyPrioritizeTasks,
  type PrioritizedTasksInput,
  type PrioritizedTasksOutput,
} from '@/ai/flows/dynamically-prioritize-tasks';

export async function prioritizeTasksAction(
  input: PrioritizedTasksInput
): Promise<PrioritizedTasksOutput> {
  try {
    const result = await dynamicallyPrioritizeTasks(input);
    return result;
  } catch (error) {
    console.error('AI prioritization failed:', error);
    // In a real app, you'd want more robust error handling and logging.
    throw new Error('Failed to prioritize tasks due to an AI service error.');
  }
}

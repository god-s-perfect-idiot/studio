'use server';

/**
 * @fileOverview This file defines a Genkit flow that dynamically prioritizes tasks using AI.
 *
 * It exports:
 *   - `dynamicallyPrioritizeTasks`: The main function to trigger the task prioritization flow.
 *   - `PrioritizedTasksInput`: The input type for the `dynamicallyPrioritizeTasks` function.
 *   - `PrioritizedTasksOutput`: The output type for the `dynamicallyPrioritizeTasks` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PrioritizedTasksInputSchema = z.object({
  taskList: z.array(
    z.string().describe('A task description to be prioritized')
  ).describe('A list of tasks to be dynamically prioritized.'),
});
export type PrioritizedTasksInput = z.infer<typeof PrioritizedTasksInputSchema>;

const PrioritizedTasksOutputSchema = z.object({
  prioritizedTasks: z.array(
    z.string().describe('A task description in prioritized order')
  ).describe('The task list, reordered based on AI analysis of optimal execution order.'),
  reasoning: z.string().describe('Explanation of the AI reordering.'),
});
export type PrioritizedTasksOutput = z.infer<typeof PrioritizedTasksOutputSchema>;

export async function dynamicallyPrioritizeTasks(input: PrioritizedTasksInput): Promise<PrioritizedTasksOutput> {
  return dynamicallyPrioritizeTasksFlow(input);
}

const prioritizeTasksPrompt = ai.definePrompt({
  name: 'prioritizeTasksPrompt',
  input: {schema: PrioritizedTasksInputSchema},
  output: {schema: PrioritizedTasksOutputSchema},
  prompt: `You are an AI task prioritization expert. Given a list of tasks, analyze them and determine the optimal order of execution.

  Tasks:
  {{#each taskList}}
  - {{this}}
  {{/each}}

  Reasoning:
  Return the reordered list and a detailed explanation of why the order was changed. Include what makes a specific task to be prioritized above the others.

  Prioritized Tasks:
  {{prioritizedTasks}}
  Reasoning: {{reasoning}}`,
});

const dynamicallyPrioritizeTasksFlow = ai.defineFlow(
  {
    name: 'dynamicallyPrioritizeTasksFlow',
    inputSchema: PrioritizedTasksInputSchema,
    outputSchema: PrioritizedTasksOutputSchema,
  },
  async input => {
    const {output} = await prioritizeTasksPrompt(input);
    return output!;
  }
);

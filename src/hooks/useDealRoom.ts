import { useState } from 'react';
import type { Deal, Resource, Task, Note, Participant, ResourceType } from '../types/deal';
import { createResource, createTask, createNote, createParticipant } from '../types/deal';

export function useDealRoom(initialDeal: Deal) {
  const [deal, setDeal] = useState<Deal>(initialDeal);

  const addResource = (name: string, type: ResourceType, url: string, addedBy?: string) => {
    const newResource = createResource(name, type, url, addedBy);
    setDeal(prev => ({
      ...prev,
      resources: [...prev.resources, newResource]
    }));
    return newResource;
  };

  const addTask = (task: string, assignee: string, dueDate: string, dependencies: string[] = []) => {
    const newTask = createTask(task, assignee, dueDate, dependencies);
    setDeal(prev => ({
      ...prev,
      actionPlan: [...prev.actionPlan, newTask]
    }));
    return newTask;
  };

  const addNote = (content: string, author: string) => {
    const newNote = createNote(content, author);
    setDeal(prev => ({
      ...prev,
      notes: [...prev.notes, newNote]
    }));
    return newNote;
  };

  const addParticipant = (email: string, role: string) => {
    const newParticipant = createParticipant(email, role);
    setDeal(prev => ({
      ...prev,
      participants: [...prev.participants, newParticipant]
    }));
    return newParticipant;
  };

  const updateTaskStatus = (taskId: string, status: Task['status']) => {
    setDeal(prev => ({
      ...prev,
      actionPlan: prev.actionPlan.map(task => {
        if (task.id === taskId) {
          return {
            ...task,
            status,
            completed: status === 'completed'
          };
        }
        return task;
      })
    }));
  };

  const toggleTaskCompletion = (taskId: string) => {
    setDeal(prev => ({
      ...prev,
      actionPlan: prev.actionPlan.map(task => {
        if (task.id === taskId) {
          const completed = !task.completed;
          return {
            ...task,
            completed,
            status: completed ? 'completed' : task.status === 'completed' ? 'pending' : task.status
          };
        }
        return task;
      })
    }));
  };

  const removeResource = (resourceId: string) => {
    setDeal(prev => ({
      ...prev,
      resources: prev.resources.filter(resource => resource.id !== resourceId)
    }));
  };

  const removeTask = (taskId: string) => {
    setDeal(prev => ({
      ...prev,
      actionPlan: prev.actionPlan.filter(task => task.id !== taskId),
      // Also remove this task from any dependencies
      actionPlan: prev.actionPlan.map(task => ({
        ...task,
        dependencies: task.dependencies.filter(dep => dep !== taskId)
      }))
    }));
  };

  const removeParticipant = (email: string) => {
    setDeal(prev => ({
      ...prev,
      participants: prev.participants.filter(p => p.email !== email)
    }));
  };

  const getDependentTasks = (taskId: string): Task[] => {
    return deal.actionPlan.filter(task => task.dependencies.includes(taskId));
  };

  const getTaskCompletion = () => {
    const completed = deal.actionPlan.filter(task => task.completed).length;
    const total = deal.actionPlan.length;
    return {
      completed,
      total,
      percentage: total > 0 ? (completed / total) * 100 : 0
    };
  };

  return {
    deal,
    addResource,
    addTask,
    addNote,
    addParticipant,
    updateTaskStatus,
    toggleTaskCompletion,
    removeResource,
    removeTask,
    removeParticipant,
    getDependentTasks,
    getTaskCompletion
  };
}
import { useState } from 'react';
import type { Playbook, PlaybookAction, TriggerConfig } from '../types/playbook';
import { createPlaybook, createPlaybookAction } from '../types/playbook';

export function usePlaybook(initialPlaybook?: Playbook) {
  const [playbook, setPlaybook] = useState<Playbook>(
    initialPlaybook || 
    createPlaybook('New Playbook', 'Description', {
      type: 'form_submission',
      name: 'Form Submission'
    })
  );

  const updatePlaybook = (updates: Partial<Playbook>) => {
    setPlaybook(prev => ({
      ...prev,
      ...updates,
      updated: new Date().toISOString()
    }));
  };

  const addAction = (action: PlaybookAction) => {
    setPlaybook(prev => ({
      ...prev,
      actions: [...prev.actions, action],
      updated: new Date().toISOString()
    }));
  };

  const updateAction = (actionId: string, updates: Partial<PlaybookAction>) => {
    setPlaybook(prev => ({
      ...prev,
      actions: prev.actions.map(action =>
        action.id === actionId
          ? { ...action, ...updates }
          : action
      ),
      updated: new Date().toISOString()
    }));
  };

  const removeAction = (actionId: string) => {
    setPlaybook(prev => ({
      ...prev,
      actions: prev.actions.filter(action => action.id !== actionId),
      updated: new Date().toISOString()
    }));
  };

  const updateTrigger = (updates: Partial<TriggerConfig>) => {
    setPlaybook(prev => ({
      ...prev,
      trigger: { ...prev.trigger, ...updates },
      updated: new Date().toISOString()
    }));
  };

  const addKnowledgeBase = (knowledgeBaseId: string, priority: number = 1) => {
    setPlaybook(prev => ({
      ...prev,
      knowledgeBases: [
        ...(prev.knowledgeBases || []),
        { id: knowledgeBaseId, priority }
      ].sort((a, b) => b.priority - a.priority),
      updated: new Date().toISOString()
    }));
  };

  const removeKnowledgeBase = (knowledgeBaseId: string) => {
    setPlaybook(prev => ({
      ...prev,
      knowledgeBases: prev.knowledgeBases?.filter(kb => kb.id !== knowledgeBaseId),
      updated: new Date().toISOString()
    }));
  };

  const updateKnowledgeBasePriority = (knowledgeBaseId: string, priority: number) => {
    setPlaybook(prev => ({
      ...prev,
      knowledgeBases: prev.knowledgeBases?.map(kb =>
        kb.id === knowledgeBaseId ? { ...kb, priority } : kb
      ).sort((a, b) => b.priority - a.priority),
      updated: new Date().toISOString()
    }));
  };

  return {
    playbook,
    updatePlaybook,
    addAction,
    updateAction,
    removeAction,
    updateTrigger,
    addKnowledgeBase,
    removeKnowledgeBase,
    updateKnowledgeBasePriority
  };
}
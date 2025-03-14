// ... (previous imports remain the same)

export function FreeModelCanvas() {
  const store = useFormStore();
  const [showGuidance, setShowGuidance] = React.useState(true);
  const beginnerOutcome = store.outcomes.find(o => o.level === 'beginner')?.text || '';

  // Add effect to update user journey when data changes
  React.useEffect(() => {
    if (store.selectedModel && store.freeFeatures.length > 0) {
      const firstChallenge = store.challenges[0];
      const firstSolution = store.solutions.find(s => s.challengeId === firstChallenge?.id);
      
      const userJourney: UserJourney = {
        discovery: {
          problem: store.productDescription.split('.')[0],
          trigger: firstChallenge?.title || '',
          initialThought: "Can this help me solve my problem?"
        },
        signup: {
          friction: store.selectedModel === 'opt-out-trial' ? 'Credit card required' : 
                   store.selectedModel === 'usage-trial' ? 'Usage limits apply' :
                   'No credit card required',
          timeToValue: store.freeFeatures.some(f => f.category === 'core') ? '< 5 minutes' : '5-15 minutes',
          guidance: store.freeFeatures
            .filter(f => f.category === 'educational')
            .map(f => f.name)
        },
        activation: {
          firstWin: firstSolution?.text || '',
          ahaFeature: store.freeFeatures.find(f => f.category === 'value-demo')?.name || '',
          timeToSuccess: '< 30 minutes'
        },
        engagement: {
          coreTasks: store.freeFeatures
            .filter(f => f.category === 'core')
            .map(f => f.name),
          collaboration: store.freeFeatures
            .filter(f => f.category === 'connection')
            .map(f => f.name),
          limitations: modelDescriptions[store.selectedModel].freeQuantityGuidelines.metrics
        },
        conversion: {
          triggers: [
            'Usage limit reached',
            'Team collaboration needed',
            'Advanced features required',
            'Scale operations'
          ],
          nextFeatures: store.freeFeatures.length > 0 ? [
            'Advanced automation',
            'Custom integrations',
            'Enterprise controls',
            'Priority support'
          ] : []
        }
      };

      store.setUserJourney(userJourney);
    }
  }, [store.selectedModel, store.freeFeatures, store.challenges, store.solutions, store.productDescription]);

  // ... (rest of the component remains the same)
}
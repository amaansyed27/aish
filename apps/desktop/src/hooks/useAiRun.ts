export function useAiRun() {
  return {
    entries: [],
    result: null,
    isRunning: false,
    error: '',
    lastIntent: '',
    runIntent: async () => undefined,
    reset: () => undefined,
  };
}

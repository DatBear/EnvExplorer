type ParameterStoreUpdateEvent = {
  parametersRetrieved: number;
  totalParameters: number;
  prefixes: Record<string, ProgressUpdateEvent>;
  isComplete: boolean;
}

type ProgressUpdateEvent = {
  current: number;
  total: number;
  isComplete: boolean;
  prefix: string;
}

export default ParameterStoreUpdateEvent;
export type { ProgressUpdateEvent };
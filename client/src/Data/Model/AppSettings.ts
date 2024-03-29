import { getAppSettingsContainer } from "./AppSettingsContainer";

export type AppSettings = {
  theme?: string;
  awsAccessKeyId: string;
  awsAccessKeySecret: string;
  awsRegion: string;
  template: string;
  rawParameterStoreAllowedPrefixes: string;
  rawParameterStoreHiddenPatterns: string;
};

export function getCurrentAppSettings() {
  const container = getAppSettingsContainer();
  return container.allAppSettings[container.currentProfile];
};
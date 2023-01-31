import Environment from "../Environment";
import { AppSettings } from "./AppSettings";

export type AppSettingsContainer = {
  profileNames: string[];
  currentProfile: string;
  allAppSettings: Record<string, AppSettings>;
}

export function getAppSettingsContainer() {
  const defaultAppSettingsContainer = {
    profileNames: ['default'],
    currentProfile: 'default',
    allAppSettings: {
      "default": {
        template: '',
        awsRegion: 'us-east-2'
      } as AppSettings
    },
    
  } as AppSettingsContainer;
  return JSON.parse(localStorage.getItem("appSettingsContainer") || JSON.stringify(defaultAppSettingsContainer)) as AppSettingsContainer;
};
import Constants from 'expo-constants';

type AppExtra = {
  unsplashAccessKey?: string;
};

const appExtra = Constants.expoConfig?.extra as AppExtra | undefined;

export const UNSPLASH_ACCESS_KEY = appExtra?.unsplashAccessKey ?? '';
export const UNSPLASH_BASE_URL = 'https://api.unsplash.com';
export const RESTCOUNTRIES_BASE_URL = 'https://restcountries.com/v3.1';

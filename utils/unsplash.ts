import { UNSPLASH_ACCESS_KEY, UNSPLASH_BASE_URL } from '@/constants/api';

export function hasUnsplashAccessKey(): boolean {
  return UNSPLASH_ACCESS_KEY.trim().length > 0;
}

export function createUnsplashPhotoUrl(destination?: string): string {
  const trimmedDestination = destination?.trim();
  if (!trimmedDestination || !hasUnsplashAccessKey()) {
    return '';
  }

  const query = encodeURIComponent(`${trimmedDestination} travel landmark`);
  const accessKey = encodeURIComponent(UNSPLASH_ACCESS_KEY.trim());
  return (
    `${UNSPLASH_BASE_URL}/search/photos?query=${query}` +
    `&per_page=1&orientation=landscape&client_id=${accessKey}`
  );
}

const appJson = require('./app.json');

const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
const unsplashAccessKey = process.env.EXPO_PUBLIC_UNSPLASH_ACCESS_KEY;

module.exports = ({ config }) => {
  const android = { ...appJson.expo.android };

  if (googleMapsApiKey) {
    android.config = {
      ...(android.config ?? {}),
      googleMaps: {
        apiKey: googleMapsApiKey,
      },
    };
  }

  return {
    ...appJson.expo,
    ...config,
    android,
    extra: {
      ...(appJson.expo.extra ?? {}),
      ...(config.extra ?? {}),
      unsplashAccessKey: unsplashAccessKey ?? '',
    },
  };
};

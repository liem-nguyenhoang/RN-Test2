import * as Sentry from '@sentry/react-native';
import Config from 'react-native-config';

export const initSentry = () => {
  const env = Config.ENV || 'development';
  const dsn = Config.SENTRY_DSN;

  if (!dsn) {
    console.log('⚠️ No SENTRY_DSN provided');
    return;
  }

  if (env === 'production' || env === 'staging') {
    Sentry.init({
      dsn,
      environment: env,
      enableAutoSessionTracking: true,
      debug: env === 'staging',
      tracesSampleRate: 1.0,
      beforeSend(event) {
        if (__DEV__) return null;
        return event;
      },
    });
    console.log(`✅ Sentry initialized (${env})`);
  } else {
    console.log('🧩 Sentry disabled in development');
  }
};

import * as Sentry from '@sentry/react-native';
import dayjs from 'dayjs';
import Config from 'react-native-config';
import { useAppContextStore } from '../stores/useAppContextStore';

type LogLevel = 'Info' | 'Warn' | 'Error' | 'Debug' | 'Api';

const isProd = Config.ENV === 'production' || Config.ENV === 'staging';
const enableDebugLog = Config.ENABLE_DEBUG_LOG === 'true' || !isProd;

const LEVEL_ICON: Record<LogLevel, string> = {
  Info: 'ℹ️',
  Warn: '⚠️',
  Error: '🛑',
  Debug: '🐞',
  Api: '🌐',
};

const getTimestamp = () => dayjs().format('YYYY-MM-DD HH:mm:ss');

const buildLogLine = (
  level: LogLevel,
  message: string,
  extra?: Record<string, any>,
): string => {
  const { userId, deviceName } = useAppContextStore.getState();
  const appName = 'RemoSmaProKey';
  const timestamp = getTimestamp();

  let msg = extra ? `${message}: ${JSON.stringify(extra)}` : message;
  if (level === 'Error' && extra instanceof Error) {
    msg = `${message}: ${JSON.stringify({
      message: extra.message,
      error: extra,
    })}`;
  }

  const icon = LEVEL_ICON[level];
  return `${icon} [${timestamp}] ${appName} ${deviceName} <${level}> ${
    userId ?? '-'
  } ${msg}`;
};

const printToConsole = (level: LogLevel, line: string) => {
  if (!enableDebugLog) return;

  switch (level) {
    case 'Error':
      console.error(line);
      break;
    case 'Warn':
      console.warn(line);
      break;
    case 'Debug':
      console.debug(line);
      break;
    default:
      console.log(line);
  }
};

/**
 * 🧩 Logger trung tâm: gửi lên Sentry (nếu prod) + log ra console (nếu debug)
 */
const writeLog = (
  level: LogLevel,
  message: string,
  extra?: Record<string, any>,
) => {
  const line = buildLogLine(level, message, extra);

  // Log local
  printToConsole(level, line);

  // Gửi Sentry nếu là lỗi và đang ở production/staging
  if (isProd && level === 'Error') {
    try {
      Sentry.captureMessage(line, { level: 'error', extra });
    } catch (err) {
      console.warn('⚠️ Failed to send log to Sentry:', err);
    }
  }
};

// ✨ Public API
export const logInfo = (msg: string, extra?: Record<string, any>) =>
  writeLog('Info', msg, extra);

export const logWarn = (msg: string, extra?: Record<string, any>) =>
  writeLog('Warn', msg, extra);

export const logDebug = (msg: string, extra?: Record<string, any>) =>
  writeLog('Debug', msg, extra);

export const logError = (msg: string, extra?: Record<string, any>) =>
  writeLog('Error', msg, extra);

export const logApi = (msg: string, extra?: Record<string, any>) =>
  writeLog('Api', msg, extra);

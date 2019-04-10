import {LoggerLevels} from '@app/config/LoggerLevels';

export const environment = {
  rootURL: '/sb',
  production: true,
  rootApiUrl: '/sbcustsvcs/api',
  rootApiUrlAuth: '/sbcustsvcs',
  consoleLogLevel: LoggerLevels.WARN,
  serverLogLevel: LoggerLevels.ERROR,
  logAPI: '/api/',
  versionCheckFrequency: 15,
  versionCheckUrl: 'version.json',
  enableVersionCheck: true
};

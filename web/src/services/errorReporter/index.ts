import { ErrorReporter } from './ErrorReporter';

export * from './types';
export * from './adapters';
export * from './utils/parseStackTrace';
export * from './ErrorReporter';

export const errorReporter = new ErrorReporter();

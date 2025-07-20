// entry.server.tsx
import * as Sentry from '@sentry/react-router';
import {
  createReadableStreamFromReadable
} from '@react-router/node';
import {
  renderToPipeableStream
} from 'react-dom/server';
import { ServerRouter } from 'react-router';

const handleRequest = Sentry.createSentryHandleRequest({
  ServerRouter,
  renderToPipeableStream,
  createReadableStreamFromReadable,
});

export default handleRequest;

export const handleError = (error: unknown, { request }: { request: Request }) => {
  if (!request.signal.aborted) {
    Sentry.captureException(error);
    console.error(error);
  }
};

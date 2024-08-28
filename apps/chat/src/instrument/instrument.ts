import * as Sentry from '@sentry/react';

Sentry.init({
	dsn: process.env.NX_CHAT_SENTRY_DSN,
	integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
	// Tracing
	tracesSampleRate: 1.0, //  Capture 100% of the transactions
	// Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
	tracePropagationTargets: ['localhost', /^https:\/\/yourserver\.io\/api/],
	// Set profilesSampleRate to 1.0 to profile every transaction.
	// Since profilesSampleRate is relative to tracesSampleRate,
	// the final profiling rate can be computed as tracesSampleRate * profilesSampleRate
	// For example, a tracesSampleRate of 0.5 and profilesSampleRate of 0.5 would
	// results in 25% of transactions being profiled (0.5*0.5=0.25)
	profilesSampleRate: 1.0,
	// Session Replay
	replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
	replaysOnErrorSampleRate: 1.0 // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});

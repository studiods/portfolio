/* Realtime collector configuration.
   Public endpoint receives anonymized portfolio visit telemetry only. */
window.__PORTFOLIO_RT_COLLECTOR__ = Object.freeze({
  enabled: true,
  endpoint: 'https://kkshbnlpmogdzkoyjait.supabase.co/functions/v1/portfolio-realtime-log',
  headers: {}
});

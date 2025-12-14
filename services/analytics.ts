/**
 * A lightweight analytics service to track user events.
 * This is a mock implementation that logs to the console. It can be easily
 * replaced with a real analytics provider like Plausible, Google Analytics, etc.
 */

type EventName = 
  | 'page_view'
  | 'generate_recipe'
  | 'save_recipe'
  | 'delete_recipe'
  | 'user_login'
  | 'user_logout'
  | 'remix_recipe';

// Use a Record to define a flexible structure for event properties
type EventProps = Record<string, string | number | boolean | undefined | null>;

/**
 * Tracks an event with a given name and optional properties.
 *
 * @param {EventName} eventName The name of the event to track.
 * @param {EventProps} [props] Optional properties to associate with the event.
 */
export const trackEvent = (eventName: EventName, props?: EventProps): void => {
  // In a real-world scenario, you would replace this console.log with a call
  // to your chosen analytics provider's SDK.
  // For example:
  //
  // if (window.plausible) {
  //   window.plausible(eventName, { props });
  // }
  //
  // Or for Google Analytics:
  //
  // if (window.gtag) {
  //   window.gtag('event', eventName, props);
  // }
  
  console.log(`[ANALYTICS] Event: ${eventName}`, props || '');

  // For Vercel Analytics (if you were using Next.js/Vercel)
  // You would typically use their library, but a manual fetch would look like:
  /*
  fetch('/_vercel/analytics/event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: eventName, ...props }),
    keepalive: true, // Ensures the request is sent even if the page is unloading
  });
  */
};

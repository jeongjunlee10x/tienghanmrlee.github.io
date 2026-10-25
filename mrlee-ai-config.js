/* MR LEE online AI is opt-in and must be provisioned on an authenticated server.
 * Deliberately no API key or placeholder endpoint in public GitHub Pages.
 * If a trusted deployment securely injects MRLEE_AI_API_URL, mrlee-assistant.js
 * validates it before sending a Firebase ID token. Do not commit secrets.
 */
window.MRLEE_AI_API_URL = typeof window.MRLEE_AI_API_URL==='string' ? window.MRLEE_AI_API_URL : '';

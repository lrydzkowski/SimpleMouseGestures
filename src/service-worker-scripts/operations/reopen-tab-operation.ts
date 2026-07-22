import { Operation } from '../operation';

export class ReopenTabOperation implements Operation {
  async doAsync() {
    const sessions = await chrome.sessions.getRecentlyClosed({ maxResults: 1 });
    if (sessions?.length > 0 && sessions[0].tab) {
      await chrome.sessions.restore(sessions[0].tab.sessionId);
    }
  }
}

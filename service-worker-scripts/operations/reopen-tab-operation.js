export class ReopenTabOperation {
  async doAsync() {
    const sessions = await chrome.sessions.getRecentlyClosed({ maxResults: 1 });
    if (sessions?.length > 0 && sessions[0].tab) {
      chrome.sessions.restore(sessions[0].tab.sessionId);
    }
  }
}

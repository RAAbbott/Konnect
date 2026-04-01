export type ConnectorError = { provider: string; error: string };

export type SlackDigest = {
  unreadHighlights: { channel?: string; text: string; ts?: string }[];
};

export type LinearDigest = {
  issuesDueToday: {
    id: string;
    title: string;
    url?: string;
    dueDate?: string | null;
  }[];
};

export type GmailDigest = {
  messages: { id: string; subject: string; from: string; snippet: string }[];
};

export type TodoistDigest = {
  tasks: {
    id: string;
    content: string;
    due?: string | null;
    projectId?: string;
    priority?: number;
  }[];
};

export type NotionDigest = {
  pages: { id: string; title: string; url?: string; lastEdited?: string }[];
};

export type AggregatedSnapshot = {
  fetchedAt: string;
  slack?: SlackDigest;
  linear?: LinearDigest;
  gmail?: GmailDigest;
  todoist?: TodoistDigest;
  notion?: NotionDigest;
  errors: ConnectorError[];
};

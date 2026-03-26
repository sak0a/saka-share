import User from "./user.type";

export type Snippet = {
  id: string;
  title?: string;
  content: string;
  language?: string;
  order: number;
};

export type CreateSnippet = {
  title?: string;
  content: string;
  language?: string;
  order?: number;
};

export type Share = {
  id: string;
  name?: string;
  files: any;
  creator?: User;
  description?: string;
  expiration: Date;
  size: number;
  hasPassword: boolean;
  type?: "FILE" | "PASTE" | "MIXED";
  pasteLanguage?: string;
  snippets?: Snippet[];
};

export type CompletedShare = Share & {
  notifyReverseShareCreator: boolean | undefined;
};

export type CreateShare = {
  id: string;
  name?: string;
  description?: string;
  recipients: string[];
  expiration: string;
  security: ShareSecurity;
  type?: "FILE" | "PASTE" | "MIXED";
  snippets?: CreateSnippet[];
};

export type ShareMetaData = {
  id: string;
  isZipReady: boolean;
};

export type MyShare = Omit<Share, "hasPassword"> & {
  views: number;
  createdAt: Date;
  security: MyShareSecurity;
};

export type MyReverseShare = {
  id: string;
  maxShareSize: string;
  shareExpiration: Date;
  remainingUses: number;
  token: string;
  shares: MyShare[];
};

export type ShareSecurity = {
  maxViews?: number;
  password?: string;
};

export type MyShareSecurity = {
  passwordProtected: boolean;
  maxViews: number;
};

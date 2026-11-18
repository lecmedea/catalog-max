export type PublicChannel = {
  url: string;
  name: string;
  description: string;
  members: number | null;
  type: string;
  avatar: string;
  sources: string[];
  checkedAt: string;
};
export function mountCatalog(root: HTMLElement, rows: PublicChannel[]): () => void;

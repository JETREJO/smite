export interface BuildItemSummary {
  position: number;
  name: string;
  category: string;
}

export interface BuildSummary {
  id: number;
  name: string;
  description: string;
  aspectName: string | null;
  roleName: string | null;
  items: BuildItemSummary[];
}

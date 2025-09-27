export type Orientation = "vertical" | "horizontal";

export interface Memory {
  id: string;
  userId: string;
  s3Url: string;
  thumbnailUrl?: string;
  tags: string[];
  caption?: string;
  createdAt: string;
  width?: number;
  height?: number;
  orientation?: Orientation;
  likes?: number;
  comments?: number;
  processed?: boolean;
}

export interface Filters {
  tags?: string[];
  userId?: string;
  date?: string;
}

export const uid = (prefix = "m") => `${prefix}_${Math.random().toString(36).slice(2, 9)}`;

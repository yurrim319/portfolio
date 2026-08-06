export type Collection = 'projects' | 'pages';

export interface ContentFile {
  collection: Collection;
  name: string;
  path: string;
}

export interface ImageAsset {
  project: string;
  name: string;
  url: string;
}

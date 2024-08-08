export interface LocalesInterface {
  namespace?: string;
  language?: string;
  resource: Record<string, string>
  deep?: boolean;
  overwrite?: boolean;
}

export interface FieldMap {
  column: string;
  attr?: string;
  include?: boolean;
  jsonArray?: boolean;
}

export interface Profile {
  name: string;
  table: string;
  primaryKey: string;
  updatedAt?: string;
  sqlFilter?: string;
  algoliaIndex: string;
  objectIdPrefix?: string;
  fields: FieldMap[];
  transform?: (row: any) => Record<string, any>;
}


export type Mapping = {
  column: string;
  attr?: string;
  include?: boolean;
  jsonArray?: boolean;
};

export type ProfileRecord = {
  profile_key: string;
  name: string;
  table_name: string;
  primary_key: string;
  updated_at_col?: string | null;
  sql_filter?: string | null;
  algolia_index: string;
  object_id_prefix?: string | null;
  url_template?: string | null;
  mappings_json: Mapping[];
};

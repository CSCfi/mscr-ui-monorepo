export type NotificationType = {
  success: {
    [key in NotificationKeys]?: boolean;
  };
};

export type NotificationKeys =
  | 'CROSSWALK_SAVE'
  | 'SCHEMA_SAVE'
  | 'CROSSWALK_PUBLISH'
  | 'SCHEMA_PUBLISH'
  | 'CROSSWALK_DEPRECATE'
  | 'SCHEMA_DEPRECATE'
  | 'CROSSWALK_INVALIDATE'
  | 'SCHEMA_INVALIDATE'
  | 'CROSSWALK_DELETE'
  | 'SCHEMA_DELETE'
  | 'EDIT_MAPPINGS'
  | 'EDIT_SCHEMA'
  | 'FINISH_EDITING_MAPPINGS'
  | 'FINISH_EDITING_SCHEMA'
  | 'CROSSWALK_REVISION'
  | 'SCHEMA_REVISION'
  | 'CROSSWALK_ADD'
  | 'SCHEMA_ADD'
  | 'CROSSWALK_COPY'
  | 'SCHEMA_COPY'
  | 'SCHEMA_SET_ROOT_SELECTION';

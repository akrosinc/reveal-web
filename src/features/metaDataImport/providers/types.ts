export interface MetaImportTag {
  identifier: string;
  locationIdentifier: string;
  locationName: string;
  entityValue: {
    metadataObjs: {
      tag: string;
      dataType: string;
      type: string;
      dateScope: boolean;
      active: boolean;
      current: {
        meta: {
          planId: string;
          userId: string;
          taskType: string;
          updateDateTime: Date;
        };
        value: {
          valueString: string;
          valueObjects: {}[];
        };
      };
    }[];
  };
}

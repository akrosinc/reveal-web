export interface MetaImportTag {
  identifier: string;
  locationIdentifier: string;
  locationName: string;
  entityValue: 
    {
      tag: string;
      dataType: string;
      type: string;
      dateScope: boolean;
      active: boolean;
      tagData: {
        meta: {
          planId: string;
          userId: string;
          taskType: string;
          updateDateTime: Date;
        };
        value: {
          valueString: string;
          valueObjects: {}[];
          valueInteger: number;
        };
      };
    }[];
  
}

import { UseExpandedOptions } from 'react-table';

//custom types for react-table
//we needed to customize this so we can use plugin options
//for each react-table plugin types should be declared here - more about it in documentation below
//https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/react-table#configuration-using-declaration-merging
declare module 'react-table' {
  export interface TableOptions<D extends object = {}>
    extends UseExpandedOptions<D>,
      UseRowStateOptions<D>,
      // note that having Record here allows you to add anything to the options, this matches the spirit of the
      // underlying js library, but might be cleaner if it's replaced by a more specific type that matches your
      // feature set, this is a safe default.
      Record<string, any> {}
}

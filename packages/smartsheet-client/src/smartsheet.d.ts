declare module "smartsheet" {
  interface Client {
    sheets: {
      getSheet(params: { id: number }): Promise<{
        columns: { id: number; title: string }[];
        rows: {
          id: number;
          cells: {
            columnId: number;
            value: string | number | boolean | null;
          }[];
        }[];
      }>;
      addRows(params: {
        sheetId: number;
        body: {
          toBottom?: boolean;
          cells: {
            columnId: number;
            value: string | number | boolean | null;
          }[];
        }[];
      }): Promise<{
        result: {
          id: number;
          cells: {
            columnId: number;
            value: string | number | boolean | null;
          }[];
        }[];
      }>;
      updateRow(params: {
        sheetId: number;
        body: {
          id: number;
          cells: {
            columnId: number;
            value: string | number | boolean | null;
          }[];
        };
      }): Promise<{
        result: {
          id: number;
          cells: {
            columnId: number;
            value: string | number | boolean | null;
          }[];
        }[];
      }>;
      deleteRow(params: { sheetId: number; rowId: number }): Promise<void>;
    };
  }

  function createClient(options: { accessToken: string }): Client;

  export { createClient };
  export default { createClient };
}

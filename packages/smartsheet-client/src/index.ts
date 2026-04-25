import smartsheet from "smartsheet";
import type {
  ShoppingItem,
  CreateShoppingItemInput,
} from "@ping-list/shared-types";

// Column names must match exactly what you created in Smartsheet
const COLUMNS = {
  NAME: "Name",
  QUANTITY: "Quantity",
  CATEGORY: "Category",
  PURCHASED: "Purchased",
  PURCHASED_AT: "PurchasedAt",
  CREATED_AT: "CreatedAt",
} as const;

type SmartsheetCell = {
  columnId: number;
  value: string | number | boolean | null;
};

type SmartsheetRow = {
  id: number;
  cells: SmartsheetCell[];
};

type ColumnMap = Record<string, number>;

function buildColumnMap(columns: { id: number; title: string }[]): ColumnMap {
  return Object.fromEntries(columns.map((col) => [col.title, col.id]));
}

function getCell(
  row: SmartsheetRow,
  columnId: number,
): SmartsheetCell["value"] {
  return row.cells.find((c) => c.columnId === columnId)?.value ?? null;
}

function rowToShoppingItem(
  row: SmartsheetRow,
  colMap: ColumnMap,
): ShoppingItem {
  return {
    id: String(row.id),
    name: String(getCell(row, colMap[COLUMNS.NAME]!) ?? ""),
    quantity: Number(getCell(row, colMap[COLUMNS.QUANTITY]!) ?? 1),
    category: String(getCell(row, colMap[COLUMNS.CATEGORY]!) ?? ""),
    purchased: Boolean(getCell(row, colMap[COLUMNS.PURCHASED]!)),
    createdAt: String(
      getCell(row, colMap[COLUMNS.CREATED_AT]!) ?? new Date().toISOString(),
    ),
    purchasedAt:
      (getCell(row, colMap[COLUMNS.PURCHASED_AT]!) as string | null) ?? null,
  };
}

export function createSmartsheetClient(token: string, sheetId: string) {
  const client = smartsheet.createClient({ accessToken: token });
  const sid = Number(sheetId);

  async function getColumnMap(): Promise<ColumnMap> {
    const sheet = await client.sheets.getSheet({ id: sid });
    return buildColumnMap(sheet.columns);
  }

  return {
    async getItems(): Promise<ShoppingItem[]> {
      const sheet = await client.sheets.getSheet({ id: sid });
      const colMap = buildColumnMap(sheet.columns);
      return (sheet.rows as SmartsheetRow[])
        .map((row) => rowToShoppingItem(row, colMap))
        .filter((item) => item.name.trim() !== "");
    },

    async createItem(input: CreateShoppingItemInput): Promise<ShoppingItem> {
      const colMap = await getColumnMap();
      const now = new Date().toISOString();
      const rows = await client.sheets.addRows({
        sheetId: sid,
        body: [
          {
            toBottom: true,
            cells: [
              { columnId: colMap[COLUMNS.NAME]!, value: input.name },
              { columnId: colMap[COLUMNS.QUANTITY]!, value: input.quantity },
              { columnId: colMap[COLUMNS.CATEGORY]!, value: input.category },
              { columnId: colMap[COLUMNS.PURCHASED]!, value: false },
              { columnId: colMap[COLUMNS.CREATED_AT]!, value: now },
              { columnId: colMap[COLUMNS.PURCHASED_AT]!, value: null },
            ],
          },
        ],
      });
      const created = rows.result[0] as SmartsheetRow;
      return rowToShoppingItem(created, colMap);
    },

    async updateItem(
      id: string,
      patch: Partial<Omit<ShoppingItem, "id" | "createdAt">>,
    ): Promise<ShoppingItem> {
      const colMap = await getColumnMap();
      const cells: SmartsheetCell[] = [];

      if (patch.name !== undefined)
        cells.push({ columnId: colMap[COLUMNS.NAME]!, value: patch.name });
      if (patch.quantity !== undefined)
        cells.push({
          columnId: colMap[COLUMNS.QUANTITY]!,
          value: patch.quantity,
        });
      if (patch.category !== undefined)
        cells.push({
          columnId: colMap[COLUMNS.CATEGORY]!,
          value: patch.category,
        });
      if (patch.purchased !== undefined) {
        cells.push({
          columnId: colMap[COLUMNS.PURCHASED]!,
          value: patch.purchased,
        });
        if (patch.purchased) {
          cells.push({
            columnId: colMap[COLUMNS.PURCHASED_AT]!,
            value: new Date().toISOString(),
          });
        }
      }

      const rows = await client.sheets.updateRow({
        sheetId: sid,
        body: { id: Number(id), cells },
      });
      const updated = rows.result[0] as SmartsheetRow;
      return rowToShoppingItem(updated, colMap);
    },

    async deleteItem(id: string): Promise<void> {
      await client.sheets.deleteRow({ sheetId: sid, rowId: Number(id) });
    },
  };
}

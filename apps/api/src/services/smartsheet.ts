import { config } from "dotenv";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
config({ path: resolve(__dirname, "../../../../.env") });

import { createSmartsheetClient } from "@ping-list/smartsheet-client";

const token = process.env.SMARTSHEET_API_TOKEN;
const sheetId = process.env.SMARTSHEET_SHEET_ID;

if (!token || !sheetId) {
  throw new Error(
    "SMARTSHEET_API_TOKEN and SMARTSHEET_SHEET_ID must be set in .env",
  );
}

export const smartsheetService = createSmartsheetClient(token, sheetId);

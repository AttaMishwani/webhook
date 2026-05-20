/*
  Warnings:

  - Added the required column `productId` to the `InventoryUpdate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productTitle` to the `InventoryUpdate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalInventory` to the `InventoryUpdate` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_InventoryUpdate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shop" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productTitle" TEXT NOT NULL,
    "totalInventory" INTEGER NOT NULL,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_InventoryUpdate" ("id", "shop", "updatedAt") SELECT "id", "shop", "updatedAt" FROM "InventoryUpdate";
DROP TABLE "InventoryUpdate";
ALTER TABLE "new_InventoryUpdate" RENAME TO "InventoryUpdate";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

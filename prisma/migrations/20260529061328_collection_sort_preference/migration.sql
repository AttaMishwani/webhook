-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CollectionSortPreference" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "collectionId" TEXT NOT NULL,
    "sortMode" TEXT NOT NULL,
    "autoSort" BOOLEAN NOT NULL DEFAULT false,
    "shop" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_CollectionSortPreference" ("collectionId", "id", "shop", "sortMode", "updatedAt") SELECT "collectionId", "id", "shop", "sortMode", "updatedAt" FROM "CollectionSortPreference";
DROP TABLE "CollectionSortPreference";
ALTER TABLE "new_CollectionSortPreference" RENAME TO "CollectionSortPreference";
CREATE UNIQUE INDEX "CollectionSortPreference_collectionId_key" ON "CollectionSortPreference"("collectionId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

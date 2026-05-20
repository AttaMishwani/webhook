-- CreateTable
CREATE TABLE "CollectionSortPreference" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "collectionId" TEXT NOT NULL,
    "sortMode" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "CollectionSortPreference_collectionId_key" ON "CollectionSortPreference"("collectionId");

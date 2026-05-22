-- CreateTable
CREATE TABLE "SortJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "collectionId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "sortMode" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "shop" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

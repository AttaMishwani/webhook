-- CreateTable
CREATE TABLE "WebhookActivity" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productId" TEXT NOT NULL,
    "productTitle" TEXT NOT NULL,
    "totalInventory" INTEGER NOT NULL,
    "productImage" TEXT,
    "collections" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

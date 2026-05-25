// app/routes/webhooks.inventory-levels-update.jsx
import prisma from "../db.server";
import {
  getSingleProductData,
} from "../services/collection.server";

import { authenticate } from "../shopify.server";

export async function action({ request }) {
  const { admin, payload  ,shop} = await authenticate.webhook(request);

 
  const inventoryItemId = payload.inventory_item_id;

  

  // Get full product data using inventory item id
  const productData = await getSingleProductData(inventoryItemId, admin);

  if (!productData) {
    console.log("No product data found for inventory item");
    return new Response(null, { status: 200 });
  }

  const {
    productId,
    productTitle,
    totalInventory,
    productImage,
    collections,
  } = productData;

  console.log("Product dataaaaaaa:", productData);


  // for front end
  const latestActivity = await prisma.webhookActivity.findFirst({
    where: { productId },
    orderBy: { createdAt: "desc" },
  });
// for front end
  if (latestActivity?.totalInventory === totalInventory) {
    console.log("Duplicate webhook ignored");
    return new Response(null, { status: 200 });
  }

// for front end
  const activity = await prisma.webhookActivity.create({
    data: {
      productId,
      productTitle,
      totalInventory,
      productImage,
      collections: JSON.stringify(collections),
    },
  });
// for front end
  console.log("Saved activity:", activity);

  const shopForDb = await prisma.session.findFirst({
    where: {
      shop,           // exact match
      isOnline: false
    }
  });

  if (!shopForDb) {
    console.error("No offline session found for shop", shop);
    return new Response(null, { status: 200 });
  }

//  backend
// process runs for each collection inside collections variable
  for (const collection of collections) {
    console.log(`Processing collection: ${collection.title}`);

    const sortPref = await prisma.collectionSortPreference.findUnique({
      where: { collectionId: collection.id },
    });

    const sortMode =
      sortPref?.sortMode ?? "inventory-high-to-low";


      await prisma.sortJob.create({
        data: {
          collectionId: collection.id,
          productId,
          sortMode,
          status: "pending",
          shop: shopForDb.shop, 
        },
      });

console.log(`Job created for collection: ${collection.title}`);
    console.log("webhook work ended")
  }

  return new Response(null, { status: 200 });
}
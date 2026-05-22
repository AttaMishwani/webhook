// app/routes/webhooks.inventory-levels-update.jsx
import prisma from "../db.server";
import {
  getProductsByCollection,
  getSingleProductData,
  reorderCollectionProducts,
  setCollectionManual,
} from "../services/collection.server";

import { authenticate } from "../shopify.server";

export async function action({ request }) {
  const { admin, payload } = await authenticate.webhook(request);

  const inventoryItemId = payload.inventory_item_id;

  console.log("Inventory item id:", inventoryItemId);

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

//  backend
// process runs for each collection inside collections variable
  for (const collection of collections) {
    console.log(`Processing collection: ${collection.title}`);

    const sortPref = await prisma.collectionSortPreference.findUnique({
      where: { collectionId: collection.id },
    });

    const sortMode =
      sortPref?.sortMode ?? "inventory-high-to-low";

    await setCollectionManual(admin, collection.id);

    // here i fetch i all products of the current collection in loop
    const products = await getProductsByCollection(admin, collection.id);

  
 
    // here i am updating the order of products of the current collection in shopify 
    await reorderCollectionProducts(admin, collection.id, products , productId ,  sortMode);

    console.log(`Done collection: ${collection.title}`);
  }

  return new Response(null, { status: 200 });
}
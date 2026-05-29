import { getProductsByCollection, setCollectionManual } from "../services/collection.server";
import prisma from "../db.server";
import { authenticate } from "../shopify.server";

export async function action({ request }) {
  const { admin, session } = await authenticate.admin(request);
  const { collectionId, sortMode , autoSort } = await request.json();

 
  
  await prisma.collectionSortPreference.upsert({
    where: { collectionId },
    update: { sortMode, autoSort }, 
    create: { collectionId, sortMode, shop: session.shop, autoSort },
  });
   
    await setCollectionManual(admin, collectionId);
 

  try {
    const products = await getProductsByCollection(admin, collectionId);

    const sorted = [...products].sort((a, b) => {
      if (sortMode === "inventory-high-to-low") return b.totalInventory - a.totalInventory;
      if (sortMode === "inventory-low-to-high") return a.totalInventory - b.totalInventory;
      if (sortMode === "out-of-stock-first") return a.totalInventory === 0 ? -1 : 1;
      return 0;
    });

    const moves = sorted.map((product, index) => ({
      id: product.id,
      newPosition: String(index),
    }));

    const res = await admin.graphql(`
      #graphql
      mutation Reorder($id: ID!, $moves: [MoveInput!]!) {
        collectionReorderProducts(id: $id, moves: $moves) {
          job { id }
          userErrors { field message }
        }
      }
    `, { variables: { id: collectionId, moves } });

    const json = await res.json();
    const errors = json.data?.collectionReorderProducts?.userErrors;
    if (errors?.length) {
      console.error("Reorder errors:", errors);
    }

    console.log("Sort complete:", collectionId);
    return { success: true };

  } catch (error) {
    console.error(" Failed to sort collection:", error);
    return { success: false, error: error.message };
  }
}
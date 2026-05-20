// app/routes/webhooks.products-update.jsx
import prisma from "../db.server";
import { getProductsByCollection, reorderCollectionProducts, setCollectionManual } from "../services/collection.server";
import { authenticate } from "../shopify.server";

export async function action({ request }) {
    const { admin, payload } = await authenticate.webhook(request);
    
    const productId = `gid://shopify/Product/${payload.id}`;
  
    console.log("FULL PAYLOAD:", payload);


console.log(`webhook fired for product: ${payload.title}`);
console.log("Webhook product id:", payload.id);


const res = await admin.graphql(`
  query GetProductCollections($id: ID!) {
    product(id: $id) {
      collections(first: 50) {
        edges {
          node { id title }
        }
      }
    }
  }
`, { variables: { id: productId } });

  const json = await res.json();
  console.log("all collection from webhook : ",json.data.product.collections.edges);
  const collections = json.data?.product?.collections?.edges ?? [];
  // here we get all the collections the product is in
  console.log(`product is in ${collections.length} collections`);

  const totalInventory = payload.variants.reduce(
    (total, variant) => total + variant.inventory_quantity,
    0
  );
  
  const productImage = payload.image?.src || null;
  
  const activity = await prisma.WebhookActivity.create({
    data: {
      productId,
      productTitle: payload.title,
      totalInventory,
      productImage,
      collections: JSON.stringify(
        collections.map((c) => ({
          id: c.node.id,
          title: c.node.title,
        }))
      ),
    },
  });
  console.log("webhook product data saved to db :" , activity);

for (const {node:collection} of collections){

  console.log(`processing collection : ${collection.title}`);

  const sortPref = await prisma.CollectionSortPreference.findUnique({
    where : {collectionId : collection.id}
  });

 
    const sortMode = sortPref.sortMode ?? "inventory-high-to-low"
    console.log(`sort mode for ${collection.title}: ${sortMode}`)
  await setCollectionManual(admin , collection.id);
  
  const products = await getProductsByCollection(admin,collection.id);

  console.log(`products returned by getProductsByCollection : ${products}`);  


     const sortedProducts = [...products].sort((a, b) => {
      if (sortMode === "inventory-high-to-low") return b.totalInventory - a.totalInventory;
      if (sortMode === "inventory-low-to-high") return a.totalInventory - b.totalInventory;
      if (sortMode === "out-of-stock-first") return a.totalInventory === 0 ? -1 : 1;
      return 0;
    });

  await reorderCollectionProducts(admin , collection.id , sortedProducts);

  console.log(`done : ${collection.title}`);
}
  

  return new Response(null, { status: 200 });
}
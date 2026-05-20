// app/routes/webhooks.products-update.jsx
import { authenticate } from "../shopify.server";

export async function action({ request }) {
    const { topic, shop, payload } = await authenticate.webhook(request);

  console.log("Webhook fired!");
  console.log("Topic:", topic);
  console.log("Shop:", shop);
  console.log("Product title:", payload.title);

  const totalInventory = payload.variants.reduce(
    (sum, v) => sum + (v.inventory_quantity ?? 0), 0
  );

  console.log("📊 Total inventory:", totalInventory);

  

  return new Response(null, { status: 200 });
}
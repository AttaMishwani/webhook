import prisma from "../db.server";
import { getProductsByCollection, reorderCollectionProducts, setCollectionManual } from "../services/collection.server";
import { authenticate } from "../shopify.server";

export async function action({request}){
  console.log("AAAAAACTION FUNCTION FIRED")
    const {admin , session} = await authenticate.admin(request);

    const {collectionId , sortMode} = await request.json();

    await prisma.CollectionSortPreference.upsert({
      where : {collectionId},
      update : {sortMode},
      create : {collectionId , sortMode , shop : session.shop}
    });

    console.log("Sort preference saved in DB:", sortMode);

    await setCollectionManual(admin , collectionId);

    const products = await getProductsByCollection(admin,collectionId);

    const sortedProducts = [...products].sort((a,b)=>{
        if(sortMode === "inventory-high-to-low") return b.totalInventory - a.totalInventory;
        if(sortMode === "inventory-low-to-high") return a.totalInventory - b.totalInventory;
        if(sortMode === "out-of-stock-first") return  a.totalInventory === 0 ? -1 : 1;
        0
    })

    await reorderCollectionProducts(admin , collectionId, sortedProducts)


  console.log("✅ Sort complete for collection:", collectionId);
  return { success: true };

}
import { getProductsByCollection } from "../services/collection.server";
import { authenticate } from "../shopify.server";

export async function loader({request}){

    const {admin} = await authenticate.admin(request);

    const url = new URL(request.url);
    const collectionID = url.searchParams.get("collectionId");

    if(!collectionID){
        return { products: [] };
    };

    const products = await getProductsByCollection(admin , collectionID);
    return products;
}
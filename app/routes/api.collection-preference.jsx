import prisma from "../db.server";
import { authenticate } from "../shopify.server";

export async function loader({request}){
    const {admin} = await authenticate.admin(request);

    const url = new URL(request.url);
    const collectionId = url.searchParams.get("collectionId");
    if (!collectionId) return { sortPreference: null };
    const sortPreference = await prisma.collectionSortPreference.findUnique({
        where:{ collectionId}
    });

    return {sortPreference}
}
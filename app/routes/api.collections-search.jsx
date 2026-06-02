import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export async function loader({ request }) {
 try {
    const { admin } = await authenticate.admin(request);

    const url = new URL(request.url);
    const query = url.searchParams.get("query");
  
    let hasNextPage = true;
    let cursor = null;
    let collections = [];
  
  
    while (hasNextPage) {
      const response = await admin.graphql(
        `
          query SearchCollections($query:String!, $cursor:String) {
            collections(first: 3, after: $cursor, query: $query) {
              edges {
                node {
                  id
                  title
                }
              }
              pageInfo {
                hasNextPage
                endCursor
              }
            }
          }
        `,
        {
          variables: {
            query,
            cursor,
          },
        }
      );
  
      const json = await response.json();
      const page = json.data?.collections;
  
      if (!page) break;
  
      collections = [...collections , ...page.edges.map((e)=> e.node)]
      hasNextPage = page.pageInfo.hasNextPage;
      cursor = page.pageInfo.endCursor;
    }
  
  
    const collectionsWithRef = await Promise.all(
      collections.map(async (collection) => {
        const sortPref = await prisma.collectionSortPreference.findUnique({
          where: { collectionId: collection.id },
        });
        return {
          ...collection,
          sortMode: sortPref?.sortMode ?? null,
          autoSort: sortPref?.autoSort ?? false,
        };
      })
    );
  
    return { collections: collectionsWithRef };
 } catch (error) {
    console.error(error);
    return { collections: [] };
 }
}
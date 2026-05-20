
export async function getCollections(admin) {
  try {
    const response = await admin.graphql(`
      #graphql
      query GetCollections {
        collections(first: 50) {
          edges {
            node {
              id
              title
            }
          }
        }
      }
    `);
    const json = await response.json();
    // Remove debug console.log
    const collections = json.data?.collections?.edges?.map((edge) => edge.node) ?? [];
    return collections;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function setCollectionManual(admin, collectionId) {
  const res = await admin.graphql(`
    mutation SetManual($id: ID!) {
      collectionUpdate(input: { 
        id: $id
        sortOrder: MANUAL 
      }) {
        collection { 
          id 
          sortOrder 
        }
        userErrors { field message }
      }
    }
  `, { variables: { id: collectionId } });

  const json = await res.json();

  const errors = json.data?.collectionUpdate?.userErrors;
  if (errors?.length) {
    console.error("❌ setCollectionManual errors:", errors);
  }

  console.log("✅ Collection set to MANUAL:", collectionId);
  return json.data;
}

export async function getProductsByCollection(admin, collectionId) {
  let products = [];
  let cursor  = null;
  let hasNextPage = true;
  try {
    while (hasNextPage) {
      const response = await admin.graphql(
        `
        #graphql
        query GetProductsByCollection($id: ID!   , $cursor: String) {
          collection(id: $id) {
            products(first: 250 , after : $cursor) {
              edges {
                node {
                  id
                  title
                  totalInventory
                  featuredImage {
                    url
                    altText
                  }
                }
              }
              pageInfo{
              hasNextPage
              endCursor
              }
            }
          }
        }
        `,
        {
          variables: {
            id: collectionId,
            cursor
          },
        }
      );
  
      const json = await response.json();
   const page = json.data.collection.products;


   products = [...products, ...page.edges.map(e => e.node)];
   hasNextPage = page.pageInfo.hasNextPage;
   cursor = page.pageInfo.endCursor;
    }
   
    return  products 
  } catch (error) {
    console.error(error);
    return { products: [] };
  }
}

export async function reorderCollectionProducts(admin , collectionId , sortedProducts){
  const moves = sortedProducts.map((product , index) => ({
    id:product.id,
    newPosition : String(index)
  }))

  try {
    const res = await admin.graphql(`
      #graphql
      mutation Reorder($id : ID! , $moves: [MoveInput!]!){
     collectionReorderProducts(id: $id , moves : $moves){
     job {id}
     userErrors {field message}
     }
      }
      `,{
        variables:{
          id:collectionId, 
          moves
        }
      });

      const json = await res.json();
      console.log(`sorted collection by reorderCollectionProducts : ${json} `);


      const errors = json.data?.collectionReorderProducts?.userErrors;
      if (errors?.length) {
        console.error("❌ reorderCollectionProducts errors:", errors);
      }


      console.log("reorderCollectionProducts json data",json.data)
   

      console.log("✅ Collection reordered, job id:", json.data?.collectionReorderProducts?.job?.id);

      return json.data;


  } catch (error) {
    console.log(error)
  }

}
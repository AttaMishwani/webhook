import "../app.css";
import SorterForm from "../components/SorterForm";
import ProductsList from "../components/ProductsList";
import { authenticate } from "../shopify.server";
import { useFetcher, useLoaderData } from "react-router";
import { getCollections } from "../services/collection.server";
import { useEffect, useState } from "react";

export async function loader({ request }) {
  const { admin, session } = await authenticate.admin(request);


  const collections = await getCollections(admin);
  return collections;
}

export default function AppIndex() {
  const [selectedCollectionId, setSelectedCollectionId] = useState("");
  const [sortMode, setSortMode] = useState("inventory-high-to-low");
  const collections = useLoaderData();
  const fetcher = useFetcher();

  const collectionOptions = collections.map((collection) => ({
    label: collection.title,
    value: collection.id,
  }));

  useEffect(() => {
    if (!selectedCollectionId) return;
    fetcher.load(
      `/api/collection-products?collectionId=${encodeURIComponent(selectedCollectionId)}`
    );
  }, [selectedCollectionId]);

  useEffect(() => {
 if(!selectedCollectionId) return
 const interval = setInterval(()=>{
fetcher.load(`/api/collection-products?collectionId=${encodeURIComponent(selectedCollectionId)}`);
 }, 10000)
 return ()=> clearInterval(interval);
  }, [selectedCollectionId])
  

  const products = fetcher.data?.products ?? [];
  const isLoading = fetcher.state === "loading" && products.length === 0;

  return (
    <s-page heading="Products">
      <SorterForm
        sortMode={sortMode}
        setSortMode={setSortMode}
        collectionOptions={collectionOptions}
        setSelectedCollectionId={setSelectedCollectionId}
        SelectedCollectionId={selectedCollectionId}
      />
      <ProductsList
        sortMode={sortMode}
        products={products}
        isLoading={isLoading}
      />
    </s-page>
  );
}
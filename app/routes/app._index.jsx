import "../app.css";
import SorterForm from "../components/SorterForm";
import WebhookActivity from "../components/WebhookActivity"

import { authenticate } from "../shopify.server";
import { useLoaderData } from "react-router";
import { getCollections } from "../services/collection.server";
import { useState } from "react";

export async function loader({ request }) {
  const { admin} = await authenticate.admin(request);
  const collections = await getCollections(admin);
  return collections;
}

export default function AppIndex() {
  const [selectedCollectionId, setSelectedCollectionId] = useState("");
  const [sortMode, setSortMode] = useState("inventory-high-to-low");
  const collections = useLoaderData();


  const collectionOptions = collections.map((collection) => ({
    label: collection.title,
    value: collection.id,
  }));

  return (
    <s-page heading="Products">
      <SorterForm
        sortMode={sortMode}
        setSortMode={setSortMode}
        collectionOptions={collectionOptions}
        setSelectedCollectionId={setSelectedCollectionId}
        SelectedCollectionId={selectedCollectionId}
      />
  <WebhookActivity/>
    </s-page>
  );
}
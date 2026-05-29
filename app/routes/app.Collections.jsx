import { authenticate } from "../shopify.server";
import "../app.css";
import { getCollections } from "../services/collection.server";
import { useLoaderData } from "react-router";
import { useEffect } from "react";
import prisma from "../db.server";

export async function loader({ request }) {
  const { admin } = await authenticate.admin(request);
  const collections = await getCollections(admin);

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

  return collectionsWithRef;
}

function getSortModeLabel(sortMode) {
  if (sortMode === "inventory-high-to-low") return "High to low";
  if (sortMode === "inventory-low-to-high") return "Low to high";
  if (sortMode === "out-of-stock-first") return "OOS first";
  return "No preference";
}

export default function Collections() {
  const collectionsWithRef = useLoaderData();

  useEffect(() => {
    console.log(collectionsWithRef);
  }, []);

  return (
    <s-page heading="Collections">
      <s-section>
        <div className="flex gap-2 items-end mb-4">
          <s-text-field
            label="Search Collections"
            placeholder="Search collections..."
          />
          <s-button variant="primary" icon="search">Search</s-button>
        </div>

        {/* Table header */}
        <div className="grid grid-cols-3 px-4 py-2 bg-gray-50 border border-gray-200 rounded-t-lg">
          <s-text variant="bodySm" fontWeight="semibold">Collection</s-text>
          <s-text variant="bodySm" fontWeight="semibold">Sort Mode</s-text>
          <s-text variant="bodySm" fontWeight="semibold">Auto Sort</s-text>
        </div>

        {/* Table rows */}
        <div className="border-l border-r border-b border-gray-200 rounded-b-lg overflow-hidden">
          {collectionsWithRef.map((c, idx) => (
            <div
              key={c.id}
              className={[
                "grid grid-cols-3 px-4 py-3 items-center",
                idx !== collectionsWithRef.length - 1 ? "border-b border-gray-100" : "",
                idx % 2 === 0 ? "bg-white" : "bg-gray-50",
              ].join(" ")}
            >
              <s-text variant="bodyMd" fontWeight="semibold">{c.title}</s-text>

              <span className="text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200 px-2 py-1 rounded w-fit">
                {getSortModeLabel(c.sortMode)}
              </span>

              <s-badge tone={c.autoSort ? "success" : "critical"}>
                {c.autoSort ? "Auto-sort ON" : "Auto-sort OFF"}
              </s-badge>
            </div>
          ))}
        </div>

      </s-section>
    </s-page>
  );
}
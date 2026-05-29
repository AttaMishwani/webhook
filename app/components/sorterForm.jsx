import { useFetcher } from "react-router";
import { useEffect, useState } from "react";

const sortingOptions = [
  { label: "Inventory high to low", value: "inventory-high-to-low" },
  { label: "Inventory low to high", value: "inventory-low-to-high" },
  { label: "Out of stock first", value: "out-of-stock-first" },
];

const modePills = [
  { value: "inventory-high-to-low", label: "High to low", icon: "↓" },
  { value: "inventory-low-to-high", label: "Low to high", icon: "↑" },
  { value: "out-of-stock-first", label: "OOS first", icon: "⊘" },
];

export default function SorterForm({
  collectionOptions,
  setSelectedCollectionId,
  SelectedCollectionId,
  sortMode,
  setSortMode,
}) {
  const sortFetcher = useFetcher();
  const preferenceFetcher = useFetcher();
  const [showSuccess, setShowSuccess] = useState(false);
  const isSorting = sortFetcher.state !== "idle";
  const [autoSort, setAutoSort] = useState(false)

  
  useEffect(() => {
    if (sortFetcher.state === "idle" && sortFetcher.data?.success === true) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [sortFetcher.state, sortFetcher.data]);

  const handleSort = () => {
    if (!SelectedCollectionId) return;
    sortFetcher.submit(
      { collectionId: SelectedCollectionId, sortMode ,autoSort },
      { method: "POST", action: "/api/sort-collection", encType: "application/json" }
    );
  };

  useEffect(() => {
  if(!SelectedCollectionId) return
  
      preferenceFetcher.load(`/api/collection-preference?collectionId=${SelectedCollectionId}`)
  
 
  }, [SelectedCollectionId])
  

  useEffect(() => {
   if(!preferenceFetcher.data) return;

   const pref = preferenceFetcher.data.sortPreference;



   if(pref){
    setAutoSort(pref.autoSort);
    setSortMode(pref.sortMode);
   }else{
    setSortMode("inventory-high-to-low");
    setAutoSort(false);
   }
  }, [preferenceFetcher.data])
  
  return (
    <s-section>
      <div className="flex flex-col gap-4">

        {/* Controls row */}
        <div className="flex flex-row gap-4 items-end">
          <s-select
            label="Select Collection"
            placeholder="Choose a collection"
            value={SelectedCollectionId}
            onChange={(e) => setSelectedCollectionId(e.target.value)}
          >
            {collectionOptions.map((c) => (
              <s-option key={c.value} value={c.value}>{c.label}</s-option>
            ))}
          </s-select>

          <s-select
            label="Sort Options"
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value)}
          >
            {sortingOptions.map((o) => (
              <s-option key={o.value} value={o.value}>{o.label}</s-option>
            ))}
          </s-select>


          <s-checkbox
  label="Enable auto-sort for this collection"
  checked={autoSort}
  onChange={(e) =>  setAutoSort(e.target.checked)}
  
/>
          <s-button
            variant="primary"
            onClick={handleSort}
            disabled={isSorting || !SelectedCollectionId}
            loading={isSorting}
          >
            {isSorting ? "Sorting…" : showSuccess ? "✓ Saved!" : "Sort & save to Shopify"}
          </s-button>
        </div>

        {/* Quick-pick pills */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-400 font-medium">Quick pick:</span>
          {modePills.map((p) => (
            <button
              key={p.value}
              onClick={() => setSortMode(p.value)}
              className={[
                "flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full border transition-all cursor-pointer",
                sortMode === p.value
                  ? "bg-green-50 border-green-300 text-green-700"
                  : "bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700",
              ].join(" ")}
            >
              <span className="font-semibold">{p.icon}</span>
              {p.label}
            </button>
          ))}
        </div>

        {/* Error banner */}
        {sortFetcher.data?.error && (
          <s-banner tone="critical">
            {sortFetcher.data.error}
          </s-banner>
        )}

        {/* Success banner */}
        {showSuccess && !sortFetcher.data?.error && (
          <s-banner tone="success">
            Collection sorted and saved to Shopify successfully.
          </s-banner>
        )}

      </div>
    </s-section>
  );
}
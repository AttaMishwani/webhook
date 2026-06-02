import { authenticate } from "../shopify.server";
import "../app.css";
import { getCollections } from "../services/collection.server";
import { useFetcher, useLoaderData } from "react-router";
import { useEffect, useState } from "react";
import prisma from "../db.server";

const sortingOptions = [
  { label: "Inventory high to low", value: "inventory-high-to-low" },
  { label: "Inventory low to high", value: "inventory-low-to-high" },
  { label: "Out of stock first", value: "out-of-stock-first" },
];

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
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editColName, setEditColName] = useState("");
  const [editColSortOp, setEditColSortOp] = useState("")
  const [editColAutoSort, setEditColAutoSort] = useState(null);
  const [editColId, setEditColId] = useState("")

  const searchFetcher = useFetcher();
  const editFetcher = useFetcher();
  const loaderData = useLoaderData();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (debouncedTerm === "") return;
    searchFetcher.load(`/api/collections-search?query=${debouncedTerm}`);
  }, [debouncedTerm]);

 useEffect(() => {
if(editFetcher.state === "idle" && editFetcher.data?.success === true){
  shopify.toast.show('Collection Updated', {
    duration: 5000,
  });
}

if(editFetcher.state === "idle" && editFetcher.data?.success ===false){
  shopify.toast.show("Something went wrong", {
    duration: 3000,
    isError: true,
  });
}
 }, [editFetcher.state , editFetcher.data])
 

  const isLoading = searchFetcher.state === "loading";

  const collectionsToShow = searchTerm === ""
    ? loaderData
    : isLoading
    ? null
    : searchFetcher.data?.collections ?? loaderData;


    const handleCollectionEdit = (id , title , sortMode , autoSort) => { 
      setIsEditing(true)
setEditColName(title);
setEditColAutoSort(autoSort);
setEditColSortOp(sortMode);
setEditColId(id)
     }


     const handleEditSave = async ()=>{
      try {
        if ( !editColName && !editColSortOp &&   !editColAutoSort ) return console.log("invalid values");


        console.log(editColName, editColSortOp, editColId , editColAutoSort);

editFetcher.submit({
  collectionId : editColId , sortMode : editColSortOp , autoSort: editColAutoSort
},
{method:"POST",   action:"/api/sort-collection" , encType : "application/json"}
)

        setIsEditing(false)
      } catch (error) {
        console.log("editing error");
        setIsEditing(false)
      }finally{
        setIsEditing(false)
      }
     }

     
  return (
    <s-page heading="Collections">
      <s-section>
        <div className="flex gap-2 items-end mb-4">
       
          {isEditing ? (
            <div className="flex items-center gap-8 w-full">
             
              <s-text-field label="Collection Name" placeholder="" value={editColName} readOnly />

              <s-select label="Sort Options" value={editColSortOp} onChange={(e)=> setEditColSortOp(e.target.value)}>
                {sortingOptions.map((o) => (
                  <s-option key={o.value} value={o.value}>{o.label}</s-option>
                ))}
              </s-select>

              <div className="flex items-center gap-2 whitespace-nowrap pt-5" >
                <s-checkbox checked={editColAutoSort} onChange={(e)=> setEditColAutoSort(e.target.checked)} label="Enable auto-sort for this collection" />
              </div>
<div className="pt-4 flex gap-4"> <s-button variant="primary" onClick={handleEditSave} icon="save">Save</s-button> 
<s-button variant="secondary" icon="delete" onClick={(e)=> setIsEditing(false)}>cancel</s-button></div>
 
             
            </div>
          ) : (
            <s-search-field
              label="Search Collections"
              placeholder="hydrogen e.g."
              onInput={(e) => setSearchTerm(e.target.value)}
              value={searchTerm}
            />
          )}
        </div>

        {isLoading && searchTerm !== "" && (
          <s-stack alignItems="center" gap="base" padding="large">
            <s-spinner accessibilityLabel="Searching collections" size="large" />
            <s-text>Searching...</s-text>
          </s-stack>
        )}

        {!isLoading && collectionsToShow && collectionsToShow.length > 0 && (
          <s-table>
            <s-table-header-row>
              <s-table-header listSlot="primary">Collection</s-table-header>
              <s-table-header listSlot="labeled">Sort Mode</s-table-header>
              <s-table-header listSlot="labeled">Auto Sort</s-table-header>
              <s-table-header listSlot="labeled">Action</s-table-header>
            </s-table-header-row>

            <s-table-body>
              {collectionsToShow.map((c) => (
                <s-table-row key={c.id}>
                  <s-table-cell>
                    <s-text variant="bodyMd" fontWeight="semibold">{c.title}</s-text>
                  </s-table-cell>
                  <s-table-cell>
                    <span className="text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200 px-2 py-1 rounded">
                      {getSortModeLabel(c.sortMode)}
                    </span>
                  </s-table-cell>
                  <s-table-cell>
                    <s-badge tone={c.autoSort ? "success" : "critical"}>
                      {c.autoSort ? "Auto-sort ON" : "Auto-sort OFF"}
                    </s-badge>
                  </s-table-cell>
                  <s-table-cell>
                    <s-button variant="primary" onClick={(e)=> handleCollectionEdit(c.id , c.title , c.sortMode , c.autoSort)} icon="edit">Edit</s-button>
                  </s-table-cell>
                </s-table-row>
              ))}
            </s-table-body>
          </s-table>
        )}

        {!isLoading && collectionsToShow && collectionsToShow.length === 0 && (
          <div className="text-center text-gray-500 py-4">No collections found</div>
        )}

      </s-section>
    </s-page>
  );
}
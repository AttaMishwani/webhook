import { useEffect } from "react"


export default function SorterForm({collectionOptions , setSelectedCollectionId , SelectedCollectionId , sortMode , setSortMode}) {
 
    const handleChange = (e)=>{
        const val = e.target.value
setSelectedCollectionId(val)

    }
    const sortingOptions = [ 
        {label : "Inventory high to low" , value : "inventory-high-to-low"},
        {label : "Inventory low to high" , value :"inventory-low-to-high"},
        {label : "Out of Stock first" , value:"out-of-stock-first"}
    ]


    
    return (
      <s-section>
        <s-form>
          <div className="flex flex-row gap-4 items-end">
            <s-select
              label="Select Collection"
              placeholder="Choose a collection"
              value={SelectedCollectionId}
              onChange={(e) => handleChange(e)}
            >
                {collectionOptions.map((collection)=> (
                    <s-option className="text-black" key={collection.value} value={collection.value}>{collection.label}</s-option>
                ))}
           
            </s-select>
  
            <s-select
              label="Sort Options"
              placeholder="e.g. Low to high"
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value)}
            >
                {
                    sortingOptions.map((option) => ( 
                        <s-option className="text-black" value={option.value} key={option.value}>{option.label}</s-option>
                    ))
                }
         
            </s-select>

            <s-button variant="primary">Sort & save to shopify</s-button>
          </div>
        </s-form>
      </s-section>
    );
  }
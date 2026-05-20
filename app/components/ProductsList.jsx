import {useMemo } from "react";

export default function ProductsList({ products, isLoading  , sortMode}) {
    if (isLoading) {
      return (
        <s-section>
          <div className="flex justify-center items-center py-16">
            <s-spinner size="large" />
          </div>
        </s-section>
      );
    }
  
    if (!products.length) {
      return (
        <s-section>
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <s-icon source="products" tone="subdued" size="800" />
            <s-text variant="headingMd" tone="subdued">No products found</s-text>
            <s-text tone="subdued">Select a collection to view its products</s-text>
          </div>
        </s-section>
      );
    }
    const sortedProducts = useMemo(() => {
      const copiedProducts = [...products];
    
      return copiedProducts.sort((a, b) => {
        const InvA = a.totalInventory ?? 0;
        const InvB = b.totalInventory ?? 0;
    
        if (sortMode === "inventory-high-to-low") {
          return InvB - InvA;
        }
    
        if (sortMode === "inventory-low-to-high") {
          return InvA - InvB;
        }
    
        if (sortMode === "out-of-stock-first") {
          if (InvA === 0 && InvB !== 0) return -1;
          if (InvA !== 0 && InvB === 0) return 1;
          return 0;
        }
    
        return 0;
      });
    }, [products, sortMode]);
   

  
    return (
      <s-section>
        {/* List header */}
        <div className="flex items-center justify-between mb-3 px-1">
          <s-text variant="headingSm">{products.length} Products</s-text>
        </div>
  
        {/* Column headers */}
        <div className="grid grid-cols-[2rem_1fr_auto] gap-4 px-4 pb-2 border-b border-[var(--s-color-border)]">
          <s-text variant="bodySm" tone="subdued">#</s-text>
          <s-text variant="bodySm" tone="subdued">Product</s-text>
          <s-text variant="bodySm" tone="subdued">Inventory</s-text>
        </div>
  
        {/* Product rows */}
        <div className="divide-y divide-[var(--s-color-border)]">
          {sortedProducts.map((product, index) => {
            const qty = product.totalInventory ?? 0;
            const isOOS = qty === 0;
            const isLow = qty > 0 && qty <= 10;
  
            return (
              <div
                key={product.id}
                className="grid grid-cols-[2rem_1fr_auto] gap-4 items-center px-4 py-3 hover:bg-[var(--s-color-bg-surface-hover)] transition-colors"
              >
                {/* Rank */}
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[var(--s-color-bg-fill-secondary)]">
                  <s-text variant="bodySm" tone="subdued">{index + 1}</s-text>
                </div>
  
                {/* Product info */}
                <div className="flex items-center gap-3 min-w-0">
                  {product.featuredImage?.url ? (
                    <img
                      src={product.featuredImage.url}
                      alt={product.featuredImage.altText ?? product.title}
                      className="w-10 h-10 rounded-md object-cover border border-[var(--s-color-border)] flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-md bg-[var(--s-color-bg-fill-secondary)] flex items-center justify-center flex-shrink-0">
                      <s-icon source="imageAlt" tone="subdued" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <s-text variant="bodyMd" fontWeight="semibold">
                      <span className="truncate block">{product.title}</span>
                    </s-text>
                    {product.sku && (
                      <s-text variant="bodySm" tone="subdued">SKU: {product.sku}</s-text>
                    )}
                  </div>
                </div>
  
                {/* Inventory badge */}
                <div className="flex-shrink-0">
                  {isOOS ? (
                    <s-badge tone="critical">Out of stock</s-badge>
                  ) : isLow ? (
                    <s-badge tone="warning">{qty} in stock</s-badge>
                  ) : (
                    <s-badge tone="success">{qty} in stock</s-badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </s-section>
    );
  } 
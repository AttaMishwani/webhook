import { useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router";

function getTimeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hr ago`;
  return `${Math.floor(diffHours / 24)} days ago`;
}

function getInventoryTone(totalInventory) {
  if (totalInventory === 0) return "critical";
  if (totalInventory <= 10) return "warning";
  return "success";
}

function getInventoryLabel(totalInventory) {
  return totalInventory === 0 ? "Out of stock" : `${totalInventory} in stock`;
}

export default function WebhookActivity() {
  const fetcher = useFetcher();
  const lastActivityIdRef = useRef(null);
  const [activities, setActivities] = useState([]);
  const [newIds, setNewIds] = useState(new Set());

  useEffect(() => {
    fetcher.load("/api/webhook-activity");
    const interval = setInterval(() => {
      fetcher.load("/api/webhook-activity");
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!fetcher.data?.activities?.length) return;
    const latestId = fetcher.data.activities[0].id;
    if (lastActivityIdRef.current !== latestId) {
      const prevIds = new Set(activities.map((a) => a.id));
      const incoming = fetcher.data.activities.filter((a) => !prevIds.has(a.id));
      if (incoming.length > 0) {
        setNewIds(new Set(incoming.map((a) => a.id)));
        setTimeout(() => setNewIds(new Set()), 3000);
      }
      lastActivityIdRef.current = latestId;
      setActivities(fetcher.data.activities);
    }
  }, [fetcher.data]);

  return (
    <s-section
      heading="Recent Inventory Updates"
      headerHidden={false}
    >
      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 gap-2">
          <s-icon source="inventoryIcon" tone="subdued" />
          <s-text tone="subdued">No recent inventory updates</s-text>
          <s-text variant="bodySm" tone="subdued">
            Updates appear here when Shopify fires inventory webhooks
          </s-text>
        </div>
      ) : (
        <s-resource-list>
          {activities.map((activity) => {
            const collections = JSON.parse(activity.collections);
            // removed: const isNew = newIds.has(activity.id);

            return (
              <s-resource-item key={activity.id}>
                <div
                  className="flex items-center justify-between w-full py-4 gap-3  px-1 transition-colors border-b-2 border-gray-200"
                >
                  {/* Left — image + info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-lg border border-gray-200 overflow-hidden shrink-0 bg-gray-50 flex items-center justify-center">
                      {activity.productImage ? (
                        <s-image
                          src={activity.productImage}
                          alt={activity.productTitle}
                          objectFit="cover"
                          aspectRatio="1/1"
                        />
                      ) : (
                        <s-thumbnail
                          alt="No image available"
                          size="large-100"
                        />
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5 min-w-0">
                      <s-text variant="bodyMd" fontWeight="semibold">
                        {activity.productTitle}
                      </s-text>

                      <div className="flex flex-wrap items-center gap-1">
                        <s-text variant="bodySm" tone="subdued">Collections:</s-text>
                        {collections && collections.length > 0 ? (
                          collections.map((c) => (
                            <span
                              key={c.id}
                              className="text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200 px-2 py-0.5 rounded"
                            >
                              {c.title}
                            </span>
                          ))
                        ) : (
                          <s-text variant="bodySm" tone="subdued">
                            <span className="italic">No collections assigned</span>
                          </s-text>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right — badge + time */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <s-badge tone={getInventoryTone(activity.totalInventory)}>
                      {getInventoryLabel(activity.totalInventory)}
                    </s-badge>
                    <s-text variant="bodySm" tone="subdued">
                      {getTimeAgo(activity.createdAt)}
                    </s-text>
                  </div>
                </div>
              </s-resource-item>
            );
          })}
        </s-resource-list>
      )}
    </s-section>
  );
}
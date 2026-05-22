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

export default function WebhookActivity() {
  const fetcher = useFetcher();
  const lastActivityIdRef = useRef(null);
  const [activities, setActivities] = useState([]);

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
      lastActivityIdRef.current = latestId;
      setActivities(fetcher.data.activities);
    }
  }, [fetcher.data]);

  return (
    <s-section heading="Recent Inventory Updates">
      {activities.length === 0 ? (
        <s-box padding="400">
          <s-text tone="subdued">No recent inventory updates</s-text>
        </s-box>
      ) : (
        <s-resource-list>
          {activities.map((activity) => {
            const collections = JSON.parse(activity.collections);
            const isOOS = activity.totalInventory === 0;
            const isLow = activity.totalInventory > 0 && activity.totalInventory <= 10;

            return (
                <s-resource-item key={activity.id}>
                <div className="flex items-center justify-between w-full py-3 border-b border-gray-200">
                  
               {/* Left — image + info */}
<div className="flex items-center gap-3">
  <s-box inlineSize="100px">
    {activity.productImage ? (
      <s-image
        src={activity.productImage}
        alt={activity.productTitle}
        borderWidth="large"
        borderStyle="solid"
        borderColor="strong"
        borderRadius="large"
        objectFit="cover"
        aspectRatio="1/1"
      ></s-image>
    ) : (
<div className="flex item-center justify-center"><s-thumbnail alt="No image available" size="large-100"></s-thumbnail></div>       
    
    )}
  </s-box>

  <div className="flex flex-col gap-2">
    <s-text variant="bodyMd" fontWeight="semibold">
      {activity.productTitle}
    </s-text>

    {/* Collections */}
    <div className="flex flex-wrap gap-1">
    <s-text variant="bodyMd" fontWeight="semibold">
      Collections: 
    </s-text>
      {/* {collections.map((c) => (
        <span
          key={c.id}
          className="text-xs px-2 py-1 rounded-full bg-gray-100 border border-gray-200 text-gray-700"
        >
          {c.title}
        </span>
      ))} */}
      {collections && collections.length > 0 ? (
        collections.map((c) => (
          <span
            key={c.id}
            className="text-xs px-2 py-1 rounded-full bg-gray-100 border border-gray-200 text-gray-700"
          >
            {c.title}
          </span>
        ))
      ) : (
        <s-text>N/A</s-text>
      )}
 
    </div>
  </div>
</div>
              
                  {/* Right — badge + time */}
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <s-badge tone={isOOS ? "critical" : isLow ? "warning" : "success"}>
                      {isOOS ? "Out of stock" : `${activity.totalInventory} in stock`}
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
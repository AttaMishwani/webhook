import prisma from "../db.server";
import { authenticate } from "../shopify.server";


export async function loader({ request }) {
    await authenticate.admin(request);
  
    const activities = await prisma.webhookActivity.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    });
   
    return { activities };
  }
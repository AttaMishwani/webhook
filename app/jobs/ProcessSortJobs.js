import prisma from "../db.server";
import shopify from "../shopify.server";
import {
  getProductsByCollection,
  reorderCollectionProducts,
  setCollectionManual
} from "../services/collection.server";

export async function ProcessPendingJobs() {
  const jobs = await prisma.sortJob.findMany({
    where: { status: "pending" },
    take: 10,
    orderBy: { createdAt: "asc" },
  });

  if (!jobs.length) return;

  console.log(`Processing ${jobs.length} jobs`);

  for (const job of jobs) {
    try {
      await prisma.sortJob.update({
        where: { id: job.id },
        data: { status: "processing" },
      });

      const session = await prisma.session.findFirst({
        where: { shop: job.shop, isOnline: false },
      });

      const { admin } = await shopify.authenticate.admin(
        new Request(`https://${job.shop}/admin`, {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        })
      );

      // FIXED: use job.collectionId
      await setCollectionManual(admin, job.collectionId);

      const products = await getProductsByCollection(admin, job.collectionId);

      await reorderCollectionProducts(
        admin,
        job.collectionId,
        products,
        job.productId,
        job.sortMode
      );

      await prisma.sortJob.update({
        where: { id: job.id },
        data: { status: "done" },
      });

      console.log(`Job done: ${job.collectionId}`);
    } catch (error) {
      console.error(`Job failed: ${job.id}`, error);

      await prisma.sortJob.update({
        where: { id: job.id },
        data: { status: "failed" },
      });
    }
  }
}
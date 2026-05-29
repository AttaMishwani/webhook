import prisma from "../db.server";
import { unauthenticated } from "../shopify.server";
import {
  setCollectionManual,
  getProductsByCollection,
  reorderCollectionProducts,
} from "../services/collection.server";

export default async function ProcessPendingJobs() {
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

      const { admin } = await unauthenticated.admin(job.shop);

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
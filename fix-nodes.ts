import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const flows = await prisma.flow.findMany();
  for (const flow of flows) {
    if (!flow.canvasData) continue;
    
    const canvas = flow.canvasData as any;
    let hasDuplicates = false;
    const seenIds = new Set();
    const newNodes = [];

    for (const node of canvas.nodes || []) {
      if (seenIds.has(node.id)) {
        // Regenerate ID for duplicate
        const oldId = node.id;
        const newId = `node_${Math.random().toString(36).substr(2, 9)}`;
        node.id = newId;
        hasDuplicates = true;
        console.log(`Fixed duplicate ${oldId} -> ${newId} in flow ${flow.id}`);
      }
      seenIds.add(node.id);
      newNodes.push(node);
    }

    if (hasDuplicates) {
      await prisma.flow.update({
        where: { id: flow.id },
        data: {
          canvasData: {
            nodes: newNodes,
            edges: canvas.edges || [],
          },
        },
      });
    }
  }
  console.log("Cleanup complete!");
}

main().catch(console.error).finally(() => prisma.$disconnect());

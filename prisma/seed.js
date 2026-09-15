import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const cropped = (filename) => `/images/cropped/${filename}`;
const thumbnail = (filename) => `/images/thumbnails/${filename}`;

const projects = [
  {
    slug: "chipmong",
    title: "01 Chipmong",
    description: "Master and daughter bedroom detail views and renders.",
    coverImage: cropped("4.png"),
    coverThumbnail: thumbnail("4.jpg"),
    images: ["4", "8", "9", "10", "11", "13", "14", "15", "16"].map((n) => cropped(`${n}.png`)),
  },
  {
    slug: "borey-angkor",
    title: "02 Borey Angkor PP",
    description: "Bedroom renders, vanity, TV wall, and bath details.",
    coverImage: cropped("6.png"),
    coverThumbnail: thumbnail("6.jpg"),
    images: ["6", "18", "19", "20", "21", "22", "23", "24"].map((n) => cropped(`${n}.png`)),
  },
  {
    slug: "sensok-villa",
    title: "03 Sensok Villa",
    description: "Living room, hall, and kitchen interior render sets.",
    coverImage: cropped("5.png"),
    coverThumbnail: thumbnail("5.jpg"),
    images: ["5", "26", "27", "28", "29", "30", "32", "33", "34", "35", "36", "38", "39", "40", "41"].map((n) =>
      cropped(`${n}.png`),
    ),
  },
  {
    slug: "technical-drawing",
    title: "04 Technical Drawing",
    description: "Technical drawing reference.",
    coverImage: cropped("7.png"),
    coverThumbnail: thumbnail("7.jpg"),
    images: [],
  },
];

async function main() {
  const now = Date.now();

  for (const [index, project] of projects.entries()) {
    // Newest-first listing order should match the numbered titles (01 first),
    // so give earlier entries a later createdAt.
    const createdAt = new Date(now - index * 1000);
    const data = { ...project, createdAt };

    await prisma.project.upsert({
      where: { slug: project.slug },
      update: data,
      create: data,
    });
    console.log(`Seeded: ${project.title}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

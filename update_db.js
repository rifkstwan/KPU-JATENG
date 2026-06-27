const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.tentangKPU.upsert({
    where: { id: "singleton" },
    update: {
      alamat: "Jl. Veteran No.1A, Semarang, Jawa Tengah 50233",
      telepon: "(024) 841 3391, (024) 841 3393",
      email: "prov_jateng@kpu.go.id",
      mapEmbedUrl: "https://maps.google.com/maps?q=KPU%20Provinsi%20Jawa%20Tengah&t=&z=15&ie=UTF8&iwloc=&output=embed"
    },
    create: {
      id: "singleton",
      profil: "Profil KPU Jawa Tengah",
      visi: "Visi KPU Jawa Tengah",
      misi: "[]",
      alamat: "Jl. Veteran No.1A, Semarang, Jawa Tengah 50233",
      telepon: "(024) 841 3391, (024) 841 3393",
      email: "prov_jateng@kpu.go.id",
      mapEmbedUrl: "https://maps.google.com/maps?q=KPU%20Provinsi%20Jawa%20Tengah&t=&z=15&ie=UTF8&iwloc=&output=embed"
    }
  });

  // Also update kontakKPU if there's any
  const kontakCount = await prisma.kontakKPU.count();
  if (kontakCount > 0) {
    const firstKontak = await prisma.kontakKPU.findFirst({ orderBy: { urutan: 'asc' }});
    if (firstKontak) {
      await prisma.kontakKPU.update({
        where: { id: firstKontak.id },
        data: {
          telepon: "(024) 841 3391, (024) 841 3393",
          email: "prov_jateng@kpu.go.id"
        }
      });
    }
  }

  console.log("Data updated successfully!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

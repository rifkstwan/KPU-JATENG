import "dotenv/config";
import { prisma } from "./src/lib/prisma";

async function main() {
  const visi = "Menjadi Penyelenggara Pemilihan Umum yang Mandiri, Professional, dan Berintegritas untuk Terwujudnya Pemilu yang LUBER dan JURDIL";
  const misi = [
    "Meningkatkan kualitas penyelenggaraan Pemilu yang efektif dan efisien, transparan, akuntabel, serta aksesibel;",
    "Meningkatkan integritas, kemandirian, kompetensi dan profesionalisme penyelenggara Pemilu dengan mengukuhkan code of conduct penyelenggara Pemilu;",
    "Menyusun regulasi di bidang Pemilu yang memberikan kepastian hukum, progesif, dan partisipatif;",
    "Meningkatkan kualitas pelayanan Pemilu untuk seluruh pemangku kepentingan;",
    "Meningkatkan partisipasi dan kualitas pemilih dalam Pemilu, Pemilih berdaulat Negara kuat; dan",
    "Mengoptimalkan pemanfaatan kemajuan teknologi informasi dalam penyelenggaraan Pemilu."
  ];

  await prisma.tentangKPU.upsert({
    where: { id: "singleton" },
    update: {
      visi: visi,
      misi: JSON.stringify(misi)
    },
    create: {
      id: "singleton",
      profil: "Profil KPU Jawa Tengah",
      visi: visi,
      misi: JSON.stringify(misi),
      alamat: "Jl. Veteran No.1A, Semarang, Jawa Tengah 50233",
      telepon: "(024) 841 3391, (024) 841 3393",
      email: "prov_jateng@kpu.go.id",
    }
  });

  console.log("Visi & Misi updated successfully!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

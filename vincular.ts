import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const sindico = await prisma.person.findFirst({ where: { role: 'SYNDIC' } });
  const condo = await prisma.condominium.findFirst();

  if (!sindico) {
    console.log('❌ Nenhum síndico encontrado');
    return;
  }
  if (!condo) {
    console.log('❌ Nenhum condomínio cadastrado');
    return;
  }

  await prisma.person.update({
    where: { id: sindico.id },
    data: { syndicOfId: condo.id },
  });

  console.log('✅ Síndico vinculado!');
  console.log('Síndico:', sindico.email);
  console.log('Condomínio:', condo.name);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

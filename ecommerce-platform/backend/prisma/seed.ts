import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Crear usuario admin
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ecommerce.com' },
    update: {},
    create: {
      email: 'admin@ecommerce.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'Sistema',
      role: 'ADMIN',
    },
  });
  console.log('✅ Usuario admin creado:', admin.email);

  // Crear usuario cliente de prueba
  const clientPassword = await bcrypt.hash('cliente123', 12);
  const client = await prisma.user.upsert({
    where: { email: 'cliente@ejemplo.com' },
    update: {},
    create: {
      email: 'cliente@ejemplo.com',
      password: clientPassword,
      firstName: 'Juan',
      lastName: 'Pérez',
      role: 'CLIENT',
    },
  });
  console.log('✅ Usuario cliente creado:', client.email);

  // Crear carrito para el cliente
  await prisma.cart.upsert({
    where: { userId: client.id },
    update: {},
    create: { userId: client.id },
  });

  // Crear productos de ejemplo
  const products = [
    {
      name: 'Laptop Pro X1',
      description: 'Laptop ultraligera con procesador Intel i7, 16GB RAM, 512GB SSD. Ideal para profesionales.',
      price: 1299.99,
      stock: 25,
      category: 'Electrónica',
      imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500',
    },
    {
      name: 'Auriculares Inalámbricos Pro',
      description: 'Cancelación de ruido activa, 30h de batería, sonido Hi-Res.',
      price: 249.99,
      stock: 100,
      category: 'Electrónica',
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
    },
    {
      name: 'Zapatillas Running Elite',
      description: 'Tecnología de amortiguación avanzada, transpirables, diseño ergonómico.',
      price: 159.99,
      stock: 50,
      category: 'Deportes',
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
    },
    {
      name: 'Mochila Antirrobo Urban',
      description: 'Diseño antirrobo con compartimento para laptop, puerto USB integrado.',
      price: 79.99,
      stock: 75,
      category: 'Accesorios',
      imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500',
    },
    {
      name: 'Cafetera Espresso Automática',
      description: 'Prepara café espresso, cappuccino y latte con un solo toque. Molinillo integrado.',
      price: 499.99,
      stock: 15,
      category: 'Hogar',
      imageUrl: 'https://images.unsplash.com/photo-1517914309068-f45f828b5529?w=500',
    },
    {
      name: 'Smartwatch Fitness Pro',
      description: 'Monitoreo de ritmo cardíaco, GPS, resistencia al agua 5ATM, 7 días de batería.',
      price: 199.99,
      stock: 40,
      category: 'Electrónica',
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
    },
    {
      name: 'Set de Yoga Premium',
      description: 'Colchoneta antideslizante, bloques de corcho, correa de algodón orgánico.',
      price: 89.99,
      stock: 30,
      category: 'Deportes',
      imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500',
    },
    {
      name: 'Lámpara LED Inteligente',
      description: 'Control por app, 16 millones de colores, compatible con Alexa y Google Home.',
      price: 49.99,
      stock: 120,
      category: 'Hogar',
      imageUrl: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=500',
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: undefined },
      update: {},
      create: product,
    });
  }
  console.log(`✅ ${products.length} productos creados`);

  console.log('🎉 Seed completado exitosamente!');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

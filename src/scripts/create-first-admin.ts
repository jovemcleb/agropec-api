import { MongoClient } from 'mongodb';
import { hash } from 'bcrypt';
import { randomUUID } from 'crypto';

const MONGO_URI = 'mongodb://localhost:27017/';
const DB_NAME = 'agropec';

async function seedAdmin() {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    console.log('Conectado ao banco de dados para criar o primeiro admin...');

    const db = client.db(DB_NAME);
    const adminCollection = db.collection('admins');

    const existingAdmin = await adminCollection.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Um administrador já existe. Nenhuma ação foi tomada.');
      return;
    }

    const firstAdmin = {
      uuid: randomUUID(),
      firstName: 'Admin',
      lastName: 'Principal',
      email: 'admin@agropec.com',
      password: await hash('senhaSuperForte123', 10), 
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await adminCollection.insertOne(firstAdmin);
    console.log('✅ Primeiro administrador criado com sucesso!');
    console.log(`   Email: ${firstAdmin.email}`);
    console.log(`   Senha: senhaSuperForte123 (lembre-se de trocá-la!)`);

  } catch (error) {
    console.error('Falha ao criar o primeiro admin:', error);
  } finally {
    await client.close();
    console.log('Conexão com o banco de dados fechada.');
  }
}

seedAdmin();
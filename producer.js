const { Kafka, Partitioners } = require('kafkajs');

// Configuration de Kafka avec le partitionneur legacy
const kafka = new Kafka({
  clientId: 'my-app',
  brokers: ['localhost:9092'],
});

const producer = kafka.producer({
  createPartitioner: Partitioners.LegacyPartitioner,
});

const sendMessage = async (topic, message) => {
  try {
    await producer.connect();
    console.log(`✅ Connecté au broker Kafka`);

    await producer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }],
    });

    console.log(`📨 Message envoyé au topic "${topic}":`, message);
  } catch (err) {
    console.error('❌ Erreur lors de l’envoi du message Kafka :', err);
  } finally {
    await producer.disconnect();
    console.log(`🔌 Producteur Kafka déconnecté`);
  }
};

// Exemple d'appel pour tester (vous pouvez commenter ça en production)
const test = async () => {
  await sendMessage('movies_topic', { title: 'Inception', description: 'A dream within a dream.' });
};

test();

module.exports = { sendMessage };

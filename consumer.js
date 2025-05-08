// consumer.js
const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'my-consumer',
  brokers: ['localhost:9092'],
});

const consumer = kafka.consumer({ groupId: 'group-id' });

const consumeMessages = async (topic) => {
  await consumer.connect();
  await consumer.subscribe({ topic, fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const value = message.value.toString();
      console.log(`✅ Received message from ${topic}: ${value}`);
      // Traite les messages ici (ex : enregistrer dans la BDD)
    },
  });
};

// Consommer plusieurs topics
consumeMessages('movies_topic');
consumeMessages('tvshows_topic');

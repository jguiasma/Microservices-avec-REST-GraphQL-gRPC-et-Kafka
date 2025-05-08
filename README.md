# 🎬 Microservices API Gateway Project

This project implements a microservices architecture using Node.js, Express, gRPC, Kafka, and GraphQL. It consists of multiple independent services (Movies and TV Shows) connected through an API Gateway and Kafka for event-driven communication.

---

## 🚀 Features

- API Gateway (REST & GraphQL)
- gRPC communication between microservices
- Kafka Producer & Consumer for asynchronous messaging
- CRUD endpoints for Movies and TV Shows
- MongoDB or other DB support (if used in services)

---

## 🛠️ Technologies Used

- Node.js
- Express
- gRPC
- Apache Kafka
- Apollo Server (GraphQL)
- MongoDB (optional for persistence)

---

## 📁 Project Structure

tp-microservices/
│
├── apiGateway.js # Gateway to access GraphQL and REST endpoints
├── movieMicroservice.js # Microservice for managing movies
├── tvShowMicroservice.js # Microservice for managing TV shows
├── producer.js # Kafka producer
├── consumer.js # Kafka consumer
├── schema.js # GraphQL type definitions
├── resolvers.js # GraphQL resolvers
├── db.js # Database connection (optional)
├── proto/ # gRPC proto files
│ ├── movie.proto
│ └── tvShow.proto
├── package.json
└── README.md
## ▶️ Run Instructions

Make sure you have Node.js, Kafka, and MongoDB (if needed) installed and running.
2. Start Kafka
Ensure Zookeeper and Kafka are running. Example (from Kafka folder):
# Start Zookeeper
bin/zookeeper-server-start.sh config/zookeeper.properties

# Start Kafka
bin/kafka-server-start.sh config/server.properties

3. Start the Services
# Start TV Show Microservice
node tvShowMicroservice.js

# Start Movie Microservice
node movieMicroservice.js

# Start Kafka Producer
node producer.js

# Start Kafka Consumer
node consumer.js

# Start API Gateway (GraphQL & REST)
node apiGateway.js

📦 Kafka Topics
movies_topic - Events related to movie creation

tvshows_topic - Events related to TV show creation
 Notes
Ensure all services are running before sending requests.

You can customize the port or database settings inside each file as needed.

const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const cors = require('cors');
const bodyParser = require('body-parser');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const { connectDB } = require('./db');
const { sendMessage } = require('./producer'); // 👈 import du producteur Kafka

// Charger les protos
const movieProtoPath = 'proto/movie.proto';
const tvShowProtoPath = 'proto/tvShow.proto';

const movieProtoDefinition = protoLoader.loadSync(movieProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const tvShowProtoDefinition = protoLoader.loadSync(tvShowProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const movieProto = grpc.loadPackageDefinition(movieProtoDefinition).movie;
const tvShowProto = grpc.loadPackageDefinition(tvShowProtoDefinition).tvShow;

// Initialiser Express
const app = express();

app.use(cors());
app.use(bodyParser.json());

// Apollo Server
const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
});

// Routes REST
function setupRoutes() {
  // Movies
  app.get('/movies', (req, res) => {
    const client = new movieProto.MovieService('localhost:50051', grpc.credentials.createInsecure());
    client.searchMovies({ query: req.query.q }, (err, response) => {
      if (err) {
        console.error('gRPC Error:', err);  // Ajout du log d'erreur
        return res.status(500).json({ error: err.message });
      }
      res.json(response.movies);
    });
  });

  app.post('/movies', async (req, res) => {
    const { title, description } = req.body;

    try {
      // Envoi du message Kafka
      await sendMessage('movies_topic', { title, description });

      // Connection au service gRPC pour créer le film
      const client = new movieProto.MovieService('localhost:50051', grpc.credentials.createInsecure());

      client.createMovie({ title, description }, (err, response) => {
        if (err) {
          console.error('gRPC Error:', err);  // Log de l'erreur gRPC
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'Movie created', movie: response.movie });
      });
    } catch (err) {
      console.error('Error in /movies POST:', err);  // Log d'erreur général
      res.status(500).json({ error: 'Erreur lors de la création du film' });
    }
  });

  // TV Shows
  app.get('/tvshows', (req, res) => {
    const client = new tvShowProto.TVShowService('localhost:50052', grpc.credentials.createInsecure());
    client.searchTvshows({ query: req.query.q }, (err, response) => {
      if (err) {
        console.error('gRPC Error:', err);  // Ajout du log d'erreur
        return res.status(500).json({ error: err.message });
      }
      res.json(response.tv_shows);
    });
  });

  app.post('/tvshows', async (req, res) => {
    const { title, description } = req.body;

    try {
      // Envoi du message Kafka
      await sendMessage('tvshows_topic', { title, description });

      const client = new tvShowProto.TVShowService('localhost:50052', grpc.credentials.createInsecure());

      client.CreateTVShow({ title, description }, (err, response) => {
        if (err) {
          console.error('gRPC Error:', err);  // Log de l'erreur gRPC
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'TV Show created', tvshow: response.tv_show });
      });
    } catch (err) {
      console.error('Error in /tvshows POST:', err);  // Log d'erreur général
      res.status(500).json({ error: 'Erreur lors de la création de la série' });
    }
  });
}

// Démarrer l'application
async function start() {
  try {
    // Connexion à la base de données
    await connectDB();
    await server.start();

    // Configuration des routes
    setupRoutes();

    app.use('/graphql', expressMiddleware(server, {
      context: async ({ req }) => ({ token: req.headers.token })
    }));

    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`🚀 API Gateway démarré sur http://localhost:${port}`);
      console.log(`📡 GraphQL disponible sur /graphql`);
    });
  } catch (err) {
    console.error('❌ Erreur démarrage:', err);
    process.exit(1);
  }
}

start();

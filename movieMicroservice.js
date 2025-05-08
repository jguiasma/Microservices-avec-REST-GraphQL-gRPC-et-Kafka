const { getDB, connectDB } = require('./db');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Charger le proto
const movieProtoPath = 'proto/movie.proto';
const movieProtoDefinition = protoLoader.loadSync(movieProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const movieProto = grpc.loadPackageDefinition(movieProtoDefinition).movie;

// Implémentation du service avec MongoDB
const movieService = {
  getMovie: async (call, callback) => {
    try {
      const db = getDB();
      const movie = await db.collection('movies').findOne({ id: call.request.movie_id });
      callback(null, { movie: movie || {} });
    } catch (err) {
      callback({
        code: grpc.status.INTERNAL,
        message: err.message
      });
    }
  },

  listAllMovies: async (call, callback) => {
    try {
      const db = getDB();
      const query = call.request.query ? 
        { $text: { $search: call.request.query } } : {};
      const movies = await db.collection('movies').find(query).toArray();
      callback(null, { movies });
    } catch (err) {
      callback({
        code: grpc.status.INTERNAL,
        message: err.message
      });
    }
  },

  createMovie: async (call, callback) => {
    try {
      const db = getDB();
      const { title, description } = call.request;
      const newMovie = {
        id: Math.random().toString(36).substring(2, 9),
        title,
        description,
        createdAt: new Date()
      };
      
      await db.collection('movies').insertOne(newMovie);
      callback(null, { movie: newMovie });
    } catch (err) {
      callback({
        code: grpc.status.INTERNAL,
        message: err.message
      });
    }
  }
};

// Démarrer le serveur
async function startServer() {
  await connectDB();
  
  const server = new grpc.Server();
  server.addService(movieProto.MovieService.service, movieService);
  
  server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), 
    (err, port) => {
      if (err) {
        console.error('❌ Échec démarrage serveur:', err);
        return;
      }
      console.log(`🎬 Service Films actif sur port ${port}`);
      server.start();
    });
}

startServer();
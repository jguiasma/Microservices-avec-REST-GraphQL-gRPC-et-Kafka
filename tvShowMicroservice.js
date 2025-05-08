const { getDB, connectDB } = require('./db');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Charger le proto
const tvShowProtoPath = 'proto/tvShow.proto';
const tvShowProtoDefinition = protoLoader.loadSync(tvShowProtoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const tvShowProto = grpc.loadPackageDefinition(tvShowProtoDefinition).tvShow;

// Implémentation du service avec MongoDB
const tvShowService = {
  getTvshow: async (call, callback) => {
    try {
      const db = getDB();
      const tvShow = await db.collection('tvshows').findOne({ id: call.request.tv_show_id });
      callback(null, { tv_show: tvShow || {} });
    } catch (err) {
      callback({
        code: grpc.status.INTERNAL,
        message: err.message
      });
    }
  },

  searchTvshows: async (call, callback) => {
    try {
      const db = getDB();
      const query = call.request.query ? 
        { $text: { $search: call.request.query } } : {};
      const tvShows = await db.collection('tvshows').find(query).toArray();
      callback(null, { tv_shows: tvShows });
    } catch (err) {
      callback({
        code: grpc.status.INTERNAL,
        message: err.message
      });
    }
  },

  CreateTVShow: async (call, callback) => {
    try {
      const db = getDB();
      const { title, description } = call.request;
      const newTVShow = {
        id: Math.random().toString(36).substring(2, 9),
        title,
        description,
        createdAt: new Date()
      };
      
      await db.collection('tvshows').insertOne(newTVShow);
      callback(null, { tv_show: newTVShow });
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
  server.addService(tvShowProto.TVShowService.service, tvShowService);
  
  server.bindAsync('0.0.0.0:50052', grpc.ServerCredentials.createInsecure(), 
    (err, port) => {
      if (err) {
        console.error('❌ Échec démarrage serveur:', err);
        return;
      }
      console.log(`📺 Service Séries actif sur port ${port}`);
      server.start();
    });
}

startServer();
const mongoose = require('mongoose');

// Database connection for aidocs with Weam integration
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/aidocs';
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB for aidocs');
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🔌 MongoDB connection closed');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    process.exit(1);
  }
};

// Common user/company fields for Weam integration
const weamUserFields = {
  user: {
    id: { type: String, required: true },
    email: { type: String, required: true },
    name: { type: String },
    avatar: { type: String }
  },
  companyId: { type: String, required: true },
  isPublic: { type: Boolean, default: false },
  tags: [{ type: String }],
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
};

// Common timestamps
const weamTimestamps = {
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
};

module.exports = {
  connectDB,
  weamUserFields,
  weamTimestamps
};

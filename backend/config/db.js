import mongoose from 'mongoose';


export const connectDB = async () => {
const uri = process.env.MONGO_URI;
await mongoose.connect(uri, { dbName: 'finance_system' });
console.log('✅ MongoDB connected');
};
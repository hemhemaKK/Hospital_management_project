import { createClient } from 'redis';


let client;
let memory = new Map();


export const initOTPStore = async () => {
if (!process.env.REDIS_URL) return;
client = createClient({ url: process.env.REDIS_URL });
client.on('error', (err) => console.error('Redis error', err));
await client.connect();
console.log('✅ Redis connected (OTP store)');
};


export const setOTP = async (email, code, ttlSeconds = 600) => {
if (client) {
await client.set(`otp:${email}`, code, { EX: ttlSeconds });
} else {
memory.set(email, { code, expires: Date.now() + ttlSeconds * 1000 });
}
};


export const getAndDeleteOTP = async (email) => {
if (client) {
const key = `otp:${email}`;
const code = await client.get(key);
if (code) await client.del(key);
return code;
} else {
const item = memory.get(email);
if (!item) return null;
memory.delete(email);
if (Date.now() > item.expires) return null;
return item.code;
}
};
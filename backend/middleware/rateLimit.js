import rateLimit from 'express-rate-limit';


export const otpLimiter = rateLimit({
windowMs: 10 * 60 * 1000,
max: 5,
message: 'Too many OTP requests. Try again later.'
});


export const authLimiter = rateLimit({
windowMs: 15 * 60 * 1000,
max: 100
});
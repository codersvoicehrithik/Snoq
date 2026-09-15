import { env } from '../config/env.js';

export async function sendPasswordResetEmail(email:string, token:string) {
  if(!env.RESEND_API_KEY || !env.EMAIL_FROM) throw Object.assign(new Error('Password reset email is not configured'),{status:503});
  const resetUrl=`${env.FRONTEND_URL}/reset-password?token=${encodeURIComponent(token)}`;
  const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({from:env.EMAIL_FROM,to:[email],subject:'Reset your SNOQ password',html:`<p>Use the secure link below to reset your SNOQ password. It expires in 30 minutes.</p><p><a href="${resetUrl}">Reset password</a></p><p>If you did not request this, you can ignore this email.</p>`})});
  if(!response.ok) throw Object.assign(new Error('Unable to send the reset email'),{status:502});
}

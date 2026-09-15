import crypto from 'node:crypto';
import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../lib/prisma.js';
import { hashPassword, signSession, verifyPassword } from '../services/auth.service.js';
import { env } from '../config/env.js';
import { requireAuth } from '../middleware/auth.js';
import { uploadAvatar } from '../services/cloudinary.service.js';
import { sendPasswordResetEmail } from '../services/mail.service.js';

export const authRouter=Router();
const credentials=z.object({email:z.string().email().transform(value=>value.toLowerCase()),password:z.string().min(8).max(128),name:z.string().trim().min(1).max(100).optional()});
const resetSchema=z.object({token:z.string().min(32),password:z.string().min(8).max(128)});
const avatarUpload=multer({storage:multer.memoryStorage(),limits:{fileSize:2*1024*1024,files:1},fileFilter:(_request,file,done)=>done(null,['image/jpeg','image/png','image/webp'].includes(file.mimetype))});
const publicUser={id:true,email:true,name:true,avatarUrl:true,createdAt:true} as const;

const sessionCookie={httpOnly:true,secure:env.COOKIE_SECURE,sameSite:env.COOKIE_SECURE?'none' as const:'lax' as const,path:'/'};
function session(res:import('express').Response,user:{id:string;email:string}) { res.cookie('rv_session',signSession({userId:user.id,email:user.email}),{...sessionCookie,maxAge:7*24*60*60*1000}); }
function secureToken() { const token=crypto.randomBytes(32).toString('hex'); return {token,tokenHash:crypto.createHash('sha256').update(token).digest('hex')}; }

authRouter.post('/signup',async(req,res)=>{const data=credentials.parse(req.body);const exists=await prisma.user.findUnique({where:{email:data.email}});if(exists)return res.status(409).json({message:'An account with that email already exists'});const user=await prisma.user.create({data:{email:data.email,name:data.name,passwordHash:await hashPassword(data.password)}});session(res,user);res.status(201).json({user:{id:user.id,email:user.email,name:user.name,avatarUrl:user.avatarUrl}});});
authRouter.post('/login',async(req,res)=>{const data=credentials.pick({email:true,password:true}).parse(req.body);const user=await prisma.user.findUnique({where:{email:data.email}});if(!user?.passwordHash||!(await verifyPassword(data.password,user.passwordHash)))return res.status(401).json({message:'Invalid email or password'});session(res,user);res.json({user:{id:user.id,email:user.email,name:user.name,avatarUrl:user.avatarUrl}});});
authRouter.post('/google',async(req,res)=>{if(!env.GOOGLE_CLIENT_ID)return res.status(503).json({message:'Google sign-in is not configured'});const {credential}=z.object({credential:z.string().min(1)}).parse(req.body);const ticket=await new OAuth2Client(env.GOOGLE_CLIENT_ID).verifyIdToken({idToken:credential,audience:env.GOOGLE_CLIENT_ID});const profile=ticket.getPayload();if(!profile?.email||!profile.sub)return res.status(401).json({message:'Invalid Google credential'});const user=await prisma.user.upsert({where:{email:profile.email.toLowerCase()},update:{googleId:profile.sub,name:profile.name??undefined,avatarUrl:profile.picture??undefined},create:{email:profile.email.toLowerCase(),googleId:profile.sub,name:profile.name,avatarUrl:profile.picture}});session(res,user);res.json({user:{id:user.id,email:user.email,name:user.name,avatarUrl:user.avatarUrl}});});
authRouter.post('/logout',(_req,res)=>{res.clearCookie('rv_session',sessionCookie);res.status(204).send();});
authRouter.get('/me',requireAuth,async(req,res)=>{const user=await prisma.user.findUnique({where:{id:req.auth!.userId},select:publicUser});if(!user)return res.status(401).json({message:'Session invalid'});res.json({user});});
authRouter.patch('/profile',requireAuth,async(req,res)=>{const {name}=z.object({name:z.string().trim().min(1).max(100)}).parse(req.body);const user=await prisma.user.update({where:{id:req.auth!.userId},data:{name},select:publicUser});res.json({user});});
authRouter.post('/avatar',requireAuth,avatarUpload.single('avatar'),async(req,res)=>{const file=req.file;if(!file)return res.status(400).json({message:'Choose a JPEG, PNG, or WebP image under 2 MB'});const uploaded=await uploadAvatar(file.buffer);const user=await prisma.user.update({where:{id:req.auth!.userId},data:{avatarUrl:uploaded.secureUrl,avatarPublicId:uploaded.publicId},select:publicUser});res.json({user});});
authRouter.post('/change-password',requireAuth,async(req,res)=>{const data=z.object({currentPassword:z.string().min(8).max(128),newPassword:z.string().min(8).max(128)}).parse(req.body);const user=await prisma.user.findUnique({where:{id:req.auth!.userId}});if(!user?.passwordHash)return res.status(400).json({message:'This account uses Google sign-in and does not have a local password'});if(!(await verifyPassword(data.currentPassword,user.passwordHash)))return res.status(400).json({message:'Your current password is incorrect'});await prisma.user.update({where:{id:user.id},data:{passwordHash:await hashPassword(data.newPassword)}});res.status(204).send();});
authRouter.post('/forgot-password',async(req,res)=>{const {email}=z.object({email:z.string().email().transform(value=>value.toLowerCase())}).parse(req.body);const user=await prisma.user.findUnique({where:{email}});if(user?.passwordHash){const {token,tokenHash}=secureToken();await prisma.$transaction([prisma.passwordResetToken.deleteMany({where:{userId:user.id}}),prisma.passwordResetToken.create({data:{userId:user.id,tokenHash,expiresAt:new Date(Date.now()+30*60*1000)}})]);await sendPasswordResetEmail(user.email,token);}res.status(204).send();});
authRouter.post('/reset-password',async(req,res)=>{const {token,password}=resetSchema.parse(req.body);const tokenHash=crypto.createHash('sha256').update(token).digest('hex');const reset=await prisma.passwordResetToken.findFirst({where:{tokenHash,expiresAt:{gt:new Date()}}});if(!reset)return res.status(400).json({message:'This reset link is invalid or has expired'});await prisma.$transaction([prisma.user.update({where:{id:reset.userId},data:{passwordHash:await hashPassword(password)}}),prisma.passwordResetToken.deleteMany({where:{userId:reset.userId}})]);res.status(204).send();});

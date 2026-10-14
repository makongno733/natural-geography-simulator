import { betterAuth } from 'better-auth'
import nodemailer from 'nodemailer'
import { database } from './database.mjs'
import { authOrigin, siteOrigin, mailReady, isProduction } from './config.mjs'

const mailer = mailReady ? nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_PORT === '465',
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
}) : null

export const auth = betterAuth({
  baseURL: authOrigin,
  secret: process.env.BETTER_AUTH_SECRET,
  database,
  trustedOrigins: [siteOrigin, authOrigin],
  emailAndPassword: {
    enabled: mailReady,
    requireEmailVerification: true,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: mailReady ? async ({ user, url }) => {
      void mailer.sendMail({
        from: process.env.MAIL_FROM,
        to: user.email,
        subject: '重设你的地理教学系统密码',
        text: `请打开链接重设密码：${url}`
      }).catch((error) => console.error('Password reset email failed', error))
    } : undefined
  },
  emailVerification: mailReady ? {
    sendOnSignUp: true,
    sendOnSignIn: true,
    sendVerificationEmail: async ({ user, url }) => {
      void mailer.sendMail({
        from: process.env.MAIL_FROM,
        to: user.email,
        subject: '验证你的地理教学系统账号',
        text: `请打开链接验证邮箱：${url}`
      }).catch((error) => console.error('Verification email failed', error))
    }
  } : undefined,
  advanced: { useSecureCookies: isProduction }
})

import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Rate limiting map (in-memory, for production use Redis)
  const emailRateLimit = new Map<string, { count: number; resetTime: number }>();
  const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
  const RATE_LIMIT_MAX = 10; // 10 emails per minute

  // Email sending endpoint with validation
  app.post("/api/send-email", async (req, res) => {
    const { to, subject, text, html } = req.body;

    // Input validation
    if (!to || typeof to !== 'string') {
      return res.status(400).json({ success: false, error: 'Recipient email is required' });
    }

    if (!subject || typeof subject !== 'string') {
      return res.status(400).json({ success: false, error: 'Email subject is required' });
    }

    if (!text && !html) {
      return res.status(400).json({ success: false, error: 'Email content (text or html) is required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return res.status(400).json({ success: false, error: 'Invalid email format' });
    }

    // Rate limiting
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const rateLimitEntry = emailRateLimit.get(clientIp);

    if (rateLimitEntry && now < rateLimitEntry.resetTime) {
      if (rateLimitEntry.count >= RATE_LIMIT_MAX) {
        return res.status(429).json({ 
          success: false, 
          error: 'Too many requests. Please try again later.' 
        });
      }
      rateLimitEntry.count++;
    } else {
      emailRateLimit.set(clientIp, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    }

    // Sanitize inputs to prevent header injection
    const sanitizedTo = to.replace(/[\r\n]/g, '');
    const sanitizedSubject = subject.replace(/[\r\n]/g, '');

    // Use environment variables for SMTP configuration
    // If not provided, we'll log the email and return success for demo purposes
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT || "587");
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpHost || !smtpUser || !smtpPass) {
      console.log("--- EMAIL LOG (SMTP not configured) ---");
      console.log(`To: ${sanitizedTo}`);
      console.log(`Subject: ${sanitizedSubject}`);
      console.log(`Text: ${text?.substring(0, 200)}...`);
      console.log("---------------------------------------");
      return res.json({ 
        success: true, 
        message: "Email logged (SMTP not configured)",
        demo: true 
      });
    }

    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: `"AdEarn Pro" <${smtpUser}>`,
        to: sanitizedTo,
        subject: sanitizedSubject,
        text,
        html,
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Failed to send email:", error);
      res.status(500).json({ success: false, error: "Failed to send email" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

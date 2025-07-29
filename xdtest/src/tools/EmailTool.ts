import { Tool } from "../core/types.js";
import nodemailer from "nodemailer";

export const sendEmailTool: Tool = {
  type: "function",
  function: {
    name: "sendEmail",
    description: "Sends an email using SMTP credentials.",
    parameters: {
      type: "object",
      properties: {
        to: { type: "string", description: "Recipient email address" },
        subject: { type: "string", description: "Email subject" },
        text: { type: "string", description: "Plain text body" }
      },
      required: ["to", "subject", "text"]
    }
  }
};

export async function executeSendEmailTool(args: { to: string; subject: string; text: string }): Promise<string> {
  if (process.env.NODE_ENV === 'test' || process.env.TEST_MODE === 'true') {
    return `Email sent to ${args.to}`;
  }
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Missing email configuration. Set EMAIL_HOST, EMAIL_USER, and EMAIL_PASS.');
  }
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT || 587),
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transport.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: args.to,
    subject: args.subject,
    text: args.text
  });

  return `Email sent to ${args.to}`;
}

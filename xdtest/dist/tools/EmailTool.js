var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import nodemailer from "nodemailer";
export const sendEmailTool = {
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
export function executeSendEmailTool(args) {
    return __awaiter(this, void 0, void 0, function* () {
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
        yield transport.sendMail({
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to: args.to,
            subject: args.subject,
            text: args.text
        });
        return `Email sent to ${args.to}`;
    });
}

import { Resend } from "resend";

export interface EmailOptions {
  to: string[];
  subject: string;
  node: React.ReactNode;
}

export async function sendEmail(key: string, email: EmailOptions) {
  const resend = new Resend(key);

  const { error } = await resend.emails.send({
    from: "Avalon Web <noreply@jdeiss.com>",
    to: email.to,
    subject: email.subject,
    react: email.node,
  });

  return error;
}


export async function sendResetEmail(key: string, userEmail: string, link: string) {
  return await sendEmail(key, {
    to: [userEmail],
    subject: "Avalon Web password reset email",
    node: (
      <>
        <p>To reset your password, please visit the following link:</p>
        <a href={link}>{link}</a>
        <p>Do not share your reset code with anyone. It will expire after one hour.</p>
        <p>If you did not attempt this password reset, change your password.</p>
      </>
    )
  });

}

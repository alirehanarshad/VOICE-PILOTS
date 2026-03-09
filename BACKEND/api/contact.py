import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from fastapi import APIRouter
from pydantic import BaseModel

from dotenv import load_dotenv

router = APIRouter()

# Explicitly load .env from the parent directory
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))

# ── Config ──────────────────────────────────────────────────────────────────
RECIPIENT_EMAIL = "ali.rehan5100@gmail.com"
SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 587


class ContactForm(BaseModel):
    name: str
    email: str
    subject: str = "General Inquiry"
    message: str


@router.post("/send")
async def send_contact_email(form: ContactForm):
    """
    Receives contact form data and sends it to the owner's Gmail inbox.
    Requires GMAIL_USER and GMAIL_APP_PASSWORD in .env
    """
    gmail_user = os.getenv("GMAIL_USER")
    gmail_pass = os.getenv("GMAIL_APP_PASSWORD")

    if not gmail_user or not gmail_pass:
        print(f"DEBUG: GMAIL_USER={gmail_user}, GMAIL_APP_PASSWORD={'SET' if gmail_pass else 'NOT SET'}")
        print(f"[Contact] ERROR: SMTP credentials not set. Message from {form.email} was NOT sent.")
        return {"ok": False, "error": "Backend SMTP not configured"}

    try:
        print(f"[Contact] Attempting to send email from {form.email}...")
        
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"[VoicePilots Contact] {form.subject} — from {form.name}"
        msg["From"] = gmail_user
        msg["To"] = RECIPIENT_EMAIL
        msg["Reply-To"] = form.email

        html_body = f"""
        <html><body style="font-family:sans-serif;background:#0a0a0a;color:#e4e4e7;padding:32px;">
          <div style="max-width:600px;margin:0 auto;background:#18181b;border-radius:16px;padding:32px;border:1px solid #27272a;">
            <h2 style="color:#a78bfa;margin-top:0;">New Contact Message</h2>
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:8px 0;color:#71717a;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;">From</td>
                  <td style="padding:8px 0;font-weight:bold;">{form.name} &lt;{form.email}&gt;</td></tr>
              <tr><td style="padding:8px 0;color:#71717a;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;">Subject</td>
                  <td style="padding:8px 0;font-weight:bold;">{form.subject}</td></tr>
            </table>
            <hr style="border:none;border-top:1px solid #27272a;margin:24px 0;" />
            <p style="line-height:1.7;color:#d4d4d8;">{form.message.replace(chr(10), '<br>')}</p>
            <hr style="border:none;border-top:1px solid #27272a;margin:24px 0;" />
            <p style="font-size:11px;color:#52525b;">Sent via VoicePilots contact form</p>
          </div>
        </body></html>
        """

        msg.attach(MIMEText(html_body, "html"))

        print(f"[Contact] Connecting to {SMTP_HOST}:{SMTP_PORT}...")
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.set_debuglevel(1)  # Detailed SMTP logs in console
            server.ehlo()
            server.starttls()
            server.login(gmail_user, gmail_pass)
            server.sendmail(gmail_user, RECIPIENT_EMAIL, msg.as_string())

        print(f"[Contact] SUCCESS: Email sent from {form.email}")
        return {"ok": True, "method": "smtp"}

    except Exception as e:
        print(f"[Contact] SMTP ERROR: {e}")
        return {"ok": False, "error": str(e)}

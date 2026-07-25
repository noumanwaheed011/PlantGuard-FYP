"""Email configuration and sending utilities."""
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

SMTP_SERVER = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
SMTP_PORT = int(os.getenv('SMTP_PORT', '587'))
SMTP_USERNAME = os.getenv('SMTP_USERNAME', '')
SMTP_PASSWORD = os.getenv('SMTP_PASSWORD', '')
EMAIL_FROM = os.getenv('EMAIL_FROM', SMTP_USERNAME)
EMAIL_FROM_NAME = os.getenv('EMAIL_FROM_NAME', 'PlantGuard AI')


def send_otp_email(to_email, otp_code, user_name=None):
    """
    Send OTP verification email.
    
    Args:
        to_email: Recipient email address
        otp_code: 6-digit OTP code
        user_name: Optional user name for personalization
    
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    if not SMTP_USERNAME or not SMTP_PASSWORD:
        print("⚠ Email not configured. Set SMTP_USERNAME and SMTP_PASSWORD in .env")
        print(f"[DEV] OTP for {to_email}: {otp_code}")
        return False
    
    try:
        # Create message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = 'PlantGuard AI - Verify Your Email'
        msg['From'] = f"{EMAIL_FROM_NAME} <{EMAIL_FROM}>"
        msg['To'] = to_email
        
        # Email body
        name = user_name or 'User'
        text_content = f"""
Hello {name},

Your verification code for PlantGuard AI is:

{otp_code}

This code will expire in 5 minutes.

If you didn't request this code, please ignore this email.

Best regards,
PlantGuard AI Team
"""
        
        html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #16a34a 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
        .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }}
        .otp-box {{ background: white; border: 2px dashed #16a34a; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }}
        .otp-code {{ font-size: 32px; font-weight: bold; color: #16a34a; letter-spacing: 8px; }}
        .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌱 PlantGuard AI</h1>
        </div>
        <div class="content">
            <p>Hello {name},</p>
            <p>Your verification code for PlantGuard AI is:</p>
            <div class="otp-box">
                <div class="otp-code">{otp_code}</div>
            </div>
            <p><strong>This code will expire in 5 minutes.</strong></p>
            <p>If you didn't request this code, please ignore this email.</p>
            <div class="footer">
                <p>Best regards,<br>PlantGuard AI Team</p>
            </div>
        </div>
    </div>
</body>
</html>
"""
        
        # Attach parts
        part1 = MIMEText(text_content, 'plain')
        part2 = MIMEText(html_content, 'html')
        msg.attach(part1)
        msg.attach(part2)
        
        # Send email
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.send_message(msg)
        
        print(f"✓ OTP email sent to {to_email}")
        return True
        
    except Exception as e:
        print(f"✗ Failed to send email to {to_email}: {e}")
        # In development, print OTP to console
        print(f"[DEV] OTP for {to_email}: {otp_code}")
        return False


def send_password_reset_email(to_email, otp_code, user_name=None):
    """Send password reset OTP email."""
    if not SMTP_USERNAME or not SMTP_PASSWORD:
        print("⚠ Email not configured. Set SMTP_USERNAME and SMTP_PASSWORD in .env")
        print(f"[DEV] Password reset OTP for {to_email}: {otp_code}")
        return False

    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = 'PlantGuard AI - Reset Your Password'
        msg['From'] = f"{EMAIL_FROM_NAME} <{EMAIL_FROM}>"
        msg['To'] = to_email

        name = user_name or 'User'
        text_content = f"""
Hello {name},

Your password reset code for PlantGuard AI is:

{otp_code}

This code will expire in 5 minutes.

If you didn't request a password reset, please ignore this email.

Best regards,
PlantGuard AI Team
"""

        html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #16a34a 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
        .content {{ background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }}
        .otp-box {{ background: white; border: 2px dashed #16a34a; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }}
        .otp-code {{ font-size: 32px; font-weight: bold; color: #16a34a; letter-spacing: 8px; }}
        .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>PlantGuard AI</h1>
        </div>
        <div class="content">
            <p>Hello {name},</p>
            <p>Your password reset code is:</p>
            <div class="otp-box">
                <div class="otp-code">{otp_code}</div>
            </div>
            <p><strong>This code will expire in 5 minutes.</strong></p>
            <p>If you didn't request a password reset, please ignore this email.</p>
            <div class="footer">
                <p>Best regards,<br>PlantGuard AI Team</p>
            </div>
        </div>
    </div>
</body>
</html>
"""

        part1 = MIMEText(text_content, 'plain')
        part2 = MIMEText(html_content, 'html')
        msg.attach(part1)
        msg.attach(part2)

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.send_message(msg)

        print(f"✓ Password reset email sent to {to_email}")
        return True

    except Exception as e:
        print(f"✗ Failed to send password reset email to {to_email}: {e}")
        print(f"[DEV] Password reset OTP for {to_email}: {otp_code}")
        return False

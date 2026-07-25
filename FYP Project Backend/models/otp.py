"""OTP model and database operations."""
from datetime import datetime
from config.database import get_db


def _purpose_filter(purpose):
    if purpose == 'signup':
        return {'$or': [{'purpose': 'signup'}, {'purpose': {'$exists': False}}]}
    return {'purpose': purpose}


class OTPVerification:
    """OTP verification model and database operations."""

    @staticmethod
    def create(email, otp_code, expires_at, purpose='signup'):
        """
        Create or update OTP verification record.

        Args:
            email: User email
            otp_code: OTP code
            expires_at: Expiry datetime
            purpose: OTP purpose ('signup' or 'password_reset')

        Returns:
            dict: OTP verification document
        """
        db = get_db()
        otp_doc = {
            'email': email.lower(),
            'otp': otp_code,
            'expiresAt': expires_at,
            'createdAt': datetime.utcnow(),
            'verified': False,
            'purpose': purpose,
        }
        delete_query = {'email': email.lower(), **_purpose_filter(purpose)}
        db.otp_verifications.delete_many(delete_query)
        result = db.otp_verifications.insert_one(otp_doc)
        otp_doc['_id'] = result.inserted_id
        return otp_doc

    @staticmethod
    def find_by_email(email, purpose='signup'):
        """Find latest OTP for email and purpose."""
        db = get_db()
        query = {'email': email.lower(), **_purpose_filter(purpose)}
        return db.otp_verifications.find_one(query, sort=[('createdAt', -1)])

    @staticmethod
    def verify(email, otp_code, purpose='signup'):
        """Verify OTP code for a given purpose."""
        otp_doc = OTPVerification.find_by_email(email, purpose)
        if not otp_doc:
            return False

        if otp_doc.get('verified'):
            return False

        if otp_doc.get('otp') != otp_code:
            return False

        if datetime.utcnow() > otp_doc.get('expiresAt'):
            return False

        db = get_db()
        db.otp_verifications.update_one(
            {'_id': otp_doc['_id']},
            {'$set': {'verified': True}}
        )

        return True

    @staticmethod
    def delete(email, purpose=None):
        """Delete OTP records for email, optionally scoped by purpose."""
        db = get_db()
        if purpose:
            db.otp_verifications.delete_many({'email': email.lower(), **_purpose_filter(purpose)})
        else:
            db.otp_verifications.delete_many({'email': email.lower()})

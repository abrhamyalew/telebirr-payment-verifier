# Telebirr Payment Verifier

Verify Telebirr payment receipts against your expected transaction details. This is useful for automating payment verification in e-commerce platforms, subscription services, or any system that accepts Telebirr payments.

Ideal for startup SaaS applications that need a simple, reliable way to verify payments just clone or integrate the code into your project and start using it immediately.

## Setup

```bash
git clone https://github.com/abrhamyalew/telebirr-payment-verifier.git
cd telebirr-payment-verifier
npm install
```

Create `.env` with your expected payment details:

```env
EXPECTED_AMOUNT=100
EXPECTED_RECIPIENT_ACCOUNT=1000123456789
EXPECTED_RECIPIENT_NAME=Abrham Yalew
EXPECTED_PAYMENT_YEAR=2025
EXPECTED_PAYMENT_MONTH=12
EXPECTED_STATUS=Completed
```

**Ensure that all expected data matches the receipt exactly in format and content.**

Run it:

```bash
node server.js
```

## API Usage

**POST** `http://localhost:5000/api/verify`

### Option 1: Use default verification (checks all fields)

Pass `defaultVerification: true` to use all fields from your config:

```json
{
  "receipt": "CJP9OSP9U",
  "defaultVerification": true
}
```

Or use the full URL:

```json
{
  "receipt": "https://transactioninfo.ethiotelecom.et/receipt/CJP9OSP9U",
  "defaultVerification": true
}
```

### Option 2: Custom field selection

Choose which fields to verify:

```json
{
  "receipt": "CJP9OSP9U",
  "defaultVerification": {
    "amount": true,
    "status": true,
    "recipientName": true,
    "date": true,
    "accountNumber": true
  }
}
```

Set any field to `false` to skip its verification.

## Batch Receipt Verification
The flexability that you get when using single receipt verification also comes with the batch verification.  

**Request:**

```json
{
  "receipt": ["CJP9OSP9U", "ABC1234567"],
  "defaultVerification": true
}
```

**Response:**

```json
{
  "result": ["CJP9OSP9U", "ABC1234567", "I12345QWER"],
  "summary": {
    "total": 3,
    "valid": 2,
    "invalid": 1
  }
}
```

## Config

Edit `config/verification.config.js` to change defaults.

## Responses

**Valid receipt:**

```json
{
  "message": "The receipt 'CJP9OSP9U' is a valid receipt."
}
```

**Mismatch found:**

```json
{
  "error": "Mismatch on amount. Expected: 85, Actual: 100"
}
```

**Receipt not found:**

```json
{
  "error": "Receipt not found or invalid"
}
```

## Fields You Can Verify

| Field           | What it checks                          |
| --------------- | --------------------------------------- |
| `amount`        | Payment amount matches                  |
| `status`        | Transaction status (e.g., "Completed")  |
| `recipientName` | Recipient name matches                  |
| `accountNumber` | Recipient account number                |
| `date`          | Payment happened in expected year/month |



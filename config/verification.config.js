const config = {
  // what feilds to verify
  defaultVerificationFields: {
    amount: true,
    status: true,
    recipientName: true,
    date: false, //to checks weather the payment happend in the current month and year important to prevent fraud
    accountNumber: true
  },

  // expected data
  expectedData: {
    expectedAmount: process.env.EXPECTED_AMOUNT || null,
    expectedStatus: "Completed",
    expectedRecipientName: process.env.EXPECTED_RECIPIENT_NAME || null,
    expectedRecipientAccount: process.env.EXPECTED_RECIPIENT_ACCOUNT || null,
    minAmount: null,
  },

  //Validation rules (a wiggle room to tolerate inconsistancies)
  validation: {
    amountTolerance: 0, // Must be exact ammount
    nameCaseSensitive: false,
    allowPartialNameMatch: true,
  },

  //API setting
  api: {
    telebirrBaseUrl: "https://transactioninfo.ethiotelecom.et/receipt/",
    timeout: 5000,
    retries: 3,
  },
};

export default config;

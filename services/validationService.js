import config from "../config/verification.config.js";
import * as cheerio from "cheerio";

const validatVerification = (rawHTML, defaultVerification, verify) => {
  const $ = cheerio.load(rawHTML);

  const accountAndName = $('lable["id=paid_reference_number"]').text();
  const parts = accountAndName.trim().split(/\s+/);
  const accountNumber = parts.shift();
  const name = parts.join(" ");

  const amount = $('td:contains("Birr")').first().text().trim();

  const status = $('td:contains("transaction status")').next("td").trim();

  const date = $('td:contains("Payment date")').next("td");

  const parsedData = {
    amount: amount,
    status: status,
    name: name,
    date: date,
    accountNumber: accountNumber,
  };

  console.log(parsedData);

  if (defaultVerification) {
    const defaultValues = config.defaultVerificationFields;
    const expectedData = config.expectedData;

    for (const key in defaultValues) {
      if (defaultVerification[key]) {
        const expected = expectedData[key];
        const parsed = parsedData[key];

        if (expected === undefined) {
          console.log(`No expected data for "${key}", skipping...`);
          continue;
        }

        if (parsed === undefined) {
          console.log(`No parsed data for "${key}", cannot verify`);
          continue;
        }

        if (String(expected).trim() === String(parsed).trim()) {
          return true;
        } else {
          return false;
        }
      }
    }
  }
};

export default validatVerification;

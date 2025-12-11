import config from "../config/verification.config.js";
import * as cheerio from "cheerio";

const validatVerification = (rawHTML, defaultVerification, verify) => {
  const $ = cheerio.load(rawHTML);

  const request = $("div").text();

  if (request === "This request is not correct") {
    return;
  }

  const accountAndName = $("#paid_reference_number").text();
  const parts = accountAndName.trim().split(/\s+/);
  const accountNumber = parts.shift();
  const name = parts.join(" ");

  const amountLabel = $('td:contains("Settled Amount")');
  const amountIndex = amountLabel.index();
  const amountFromTable = amountLabel
    .parent("tr")
    .next("tr")
    .find("td")
    .eq(amountIndex)
    .text()
    .replace("Birr", "")
    .trim();

  const dateLabel = $('td:contains("Payment date")');
  const dateIndex = dateLabel.index();
  const date = dateLabel
    .parent("tr")
    .next("tr")
    .find("td")
    .eq(dateIndex)
    .text()
    .trim();

  const status = $('td:contains("transaction status")')
    .next("td")
    .text()
    .trim();

  const parsedData = {
    amount: amountFromTable,
    status: status,
    recipientName: name,
    date: date,
    accountNumber: accountNumber,
  };

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

        if (String(expected).trim() !== String(parsed).trim()) {
          console.log(
            `Mismatch on ${key}. Expected: ${expected}, Actual: ${parsed}`
          );
          return false;
        }
      }
    }
    return true;
  }
};

export default validatVerification;

import { telebirrParser, cbeParser } from "../utils/receiptParser.js";
import receiptService from "../services/receiptService.js";
import validationService from "../services/validationService.js";
import { ValidationError } from "../utils/errorHandler.js";
const getTelebirrReceipt = async (req, res) => {
  try {
    const { receipt, defaultVerification } = req.body;

    if (defaultVerification === undefined || receipt === undefined) {
      throw new ValidationError("defaultVerification or receipt missing");
    }

    let ID, getRawReceiptData;

    if (receipt.toLowerCase().includes("telebirr")) {
      ID = telebirrParser(receipt);

      if (!ID) return res.status(400).json({ error: "Invalid TeleBirr Receipt ID" });

      getRawReceiptData = await receiptService(ID);
    } else if (receipt.toLowerCase().includes("cbe")) {
      ID = cbeParser(receipt);

      if (!ID) return res.status(400).json({ error: "Invalid CBE Receipt ID" });

      getRawReceiptData = await receiptService(ID);
    }

    if (!ID) {
      return res.status(400).json({ error: "Invalid Receipt ID" });
    }

    const validationResult = validationService(
      getRawReceiptData,
      defaultVerification
    );

    if (validationResult) {
      return res
        .status(200)
        .json({ message: `The receipt '${ID}' is a valid receipt.` });
    }
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message });
  }
};

export default getTelebirrReceipt;

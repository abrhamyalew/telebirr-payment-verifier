import config from "../config/verification.config.js";
import receiptParser from "../utils/receiptParser.js";
import receiptService from "../services/receiptService.js";
import validationService from "../services/validationService.js";

const getTellebirrReceipt = async (req, res) => {
  try {
    const { receipt, defaultVerification } = req.body;

    const ID = receiptParser(receipt);

    if (!ID) {
      return res.status(400).json({ error: "Invalid Receipt ID" });
    }

    const getRawReceiptData = await receiptService(ID);

    const validationResult = validationService(
      getRawReceiptData,
      defaultVerification,
    );

    if (validationResult) {
      return res.json({ message: `The receipt ${ID} is valid.` });
    } else {
      return res.json({ message: `The receipt ${ID} is not valid.`});
    }
  } catch (error) {
    console.error("Error: ", error);
    return res.status(400).json({ message: "Error: error validating receipt" });
  }
};

export default getTellebirrReceipt;

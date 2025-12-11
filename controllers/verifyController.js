import config from "../config/verification.config.js";
import receiptParser from "../utils/receiptParser.js";
import receiptService from "../services/receiptService.js";
import validationService from "../services/validationService.js";

const getTellebirrReceipt = async (req, res) => {
  try {
    const { receipt } = req.body;
    const { defaultVerification } = req.body; // boolean 
    const { verify } = req.body;

    const ID = receiptParser(receipt);

    if (!ID) {
      return res.status(400).json({ error: "Invalid Receipt ID" });
    }

    const getRawReceiptData = await receiptService(ID);

    const validationResult = validationService(
      getRawReceiptData,
      defaultVerification,
      verify
    );

  } catch (error) {
    console.error("Error: ", error);
    return res.status(400).json({ message: "Error: error validating receipt" });
  }
};

export default getTellebirrReceipt;

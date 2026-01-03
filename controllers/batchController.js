import { getReceiptData } from "../services/receiptService.js";
import {
  telebirrVerification,
  cbeVerification,
  boaVerification,
} from "../services/validationService.js";
import { processBatch } from "../services/batchProcessor.js";
import {
  telebirrParser,
  cbeParser,
  boaParser,
} from "../utils/receiptParser.js";
import { ValidationError } from "../utils/errorHandler.js";

const verifySingleReceipt = async (receipt, defaultVerification) => {
  if (!receipt) return null;

  const trimedReceipt = receipt.trim();
  let ID, getRawReceiptData, validationResult;

  if (
    trimedReceipt.toLowerCase().includes("ethiotelecom") ||
    /^[A-Z0-9]{10}$/.test(trimedReceipt)
  ) {
    // Telebirr
    ID = telebirrParser(trimedReceipt);
    if (!ID) throw new Error("Invalid TeleBirr Receipt ID");

    getRawReceiptData = await getReceiptData(ID);
    validationResult = telebirrVerification(
      getRawReceiptData,
      defaultVerification
    );
  } else if (
    trimedReceipt.toLowerCase().includes("cbe") ||
    /^[A-Z0-9]{12}\d{8}$/.test(trimedReceipt) ||
    /^[A-Z0-9]{12}&\d{8}$/.test(trimedReceipt)
  ) {
    // CBE
    ID = cbeParser(trimedReceipt);
    if (!ID) throw new Error("Invalid CBE Receipt ID");

    getRawReceiptData = await getReceiptData(ID);
    validationResult = await cbeVerification(
      getRawReceiptData,
      defaultVerification
    );
  } else if (
    trimedReceipt.toLowerCase().includes("bankofabyssinia") ||
    /^FT\d{5}[A-Z0-9]{5}\d{5}$/.test(trimedReceipt)
  ) {
    // BOA
    ID = boaParser(trimedReceipt);
    if (!ID) throw new Error("Invalid BOA Receipt ID");

    getRawReceiptData = await getReceiptData(ID);
    validationResult = await boaVerification(
      getRawReceiptData,
      defaultVerification
    );
  } else {
    throw new ValidationError(`Receipt '${receipt}' is not recognized`);
  }

  if (validationResult) {
    return receipt;
  }
  return null;
};

const batchVerify = async (req, res) => {
  try {
    const { receipt, defaultVerification } = req.body;

    if (!Array.isArray(receipt)) {
      throw new ValidationError("receipt must be an array");
    }

    if (defaultVerification === undefined || receipt === undefined) {
      throw new ValidationError("defaultVerification is required");
    }

    let validReceipts = [];
    let failedReceipts = [];

    // Check if parallel processing is enabled
    const { enableParallelProcessing } = (
      await import("../config/performance.config.js")
    ).default.batch;

    if (enableParallelProcessing) {
      // Use parallel batch processor
      const results = await processBatch(receipt, (item) =>
        verifySingleReceipt(item, defaultVerification)
      );

      validReceipts = results.valid;
      failedReceipts = results.failed.map((f) => ({
        receiptId: f.item,
        error: f.error,
      }));
    } else {
      // Use sequential processing (original implementation)
      for (const element of receipt) {
        if (!element) continue;

        try {
          const result = await verifySingleReceipt(
            element,
            defaultVerification
          );
          if (result) {
            validReceipts.push(result);
          }
        } catch (error) {
          failedReceipts.push({
            receiptId: element,
            error: error.message,
          });
        }
      }
    }

    return res.status(200).json({
      validReceipts: validReceipts,
      failedReceipts: failedReceipts,
      summary: {
        total: receipt.length,
        valid: validReceipts.length,
        invalid: failedReceipts.length,
      },
    });
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message });
  }
};

export default batchVerify;

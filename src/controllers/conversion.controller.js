import Request from "../models/request.model.js";
import {
  fetchCurrencyCodes,
  fetchExchangeRate,
} from "../services/coinbase.service.js";

const validateParams = async ({ from, to, amount }) => {
  if (!from) {
    return {
      success: false,
      code: 400,
      message: "Missing 'from' query parameter",
    };
  }

  if (!to) {
    return {
      success: false,
      code: 400,
      message: "Missing 'to' query parameter",
    };
  }

  if (!amount) {
    return {
      success: false,
      code: 400,
      message: "Missing 'amount' query parameter",
    };
  }

  if (isNaN(amount)) {
    return {
      success: false,
      code: 400,
      message: "'amount' query parameter must be a number",
    };
  }

  try {
    // Fetches all fiat and crypto currency codes supported by coinbase
    // Cached using redis with TTL of 6 hours
    const validCurrencyCodes = await fetchCurrencyCodes();

    if (!validCurrencyCodes.includes(from)) {
      return {
        success: false,
        code: 400,
        message: "Invalid 'from' currency code",
      };
    }

    if (!validCurrencyCodes.includes(to)) {
      return {
        success: false,
        code: 400,
        message: "Invalid 'to' currency code",
      };
    }
  } catch (error) {
    return {
      success: false,
      code: 500,
      message: error.message,
    };
  }

  return {
    success: true,
  };
};

export const getConversion = async (req, res) => {
  const { from, to, amount } = req.query;

  // performs all validation
  // if success !== true, then return an error message
  const { success, code, message } = await validateParams({ from, to, amount });

  if (!success) {
    res.status(code).json({
      message,
    });
    return;
  }

  try {
    // fetch exchange rate between from and to
    const exchangeRate = await fetchExchangeRate(from, to);

    // calculate converted amount using amount param and fetched exchange rate
    const convertedAmount = amount * exchangeRate;

    const responseBody = {
      from,
      to,
      amount: parseFloat(amount),
      convertedAmount,
    };

    // save this request params, body, user and apiVersion in the db
    // user is used for the daily request limit count
    // apiVersion is added to give context to the body in case it changes with future versions
    await new Request({
      params: req.query,
      body: responseBody,
      user: req.user._id,
      apiVersion: "v1",
    }).save();

    res.status(200).json(responseBody);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

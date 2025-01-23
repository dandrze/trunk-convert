import axios from "axios";
import { getJwtToken } from "./jwt.service.js";
import redisClient from "../database/redis.database.js";

const coinbaseAPI = axios.create({
  baseURL: process.env.COINBASE_API_BASE,
});

// gets a signed token using JWT using provided config
const getCoinbaseJwtToken = async () => {
  const coinbaseJwtConfig = {
    name: process.env.COINBASE_API_KEY_NAME,
    secret: process.env.COINBASE_API_SECRET,
    uri: process.env.COINBASE_JWT_TOKEN_URI,
  };

  return getJwtToken(coinbaseJwtConfig);
};

// generic fetch function to use for all api calls to coinbase
const fetchDataFromCoinbase = async (path, params = {}) => {
  try {
    // fetches a new jwt token for each new request
    // this was requested by coinbase in their docs: https://docs.cdp.coinbase.com/coinbase-app/docs/quickstart
    // ideally we would cache this token using redis and only fetch a new one when it expires
    const jwtToken = await getCoinbaseJwtToken();

    const response = await coinbaseAPI.get(path, {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
      params,
    });

    return response.data;
  } catch (error) {
    // Additional error handling would go here, for now this is handled by the controller try/catch
    throw error;
  }
};

// fetches all exchange rates for a given currency code
const fetchExchangeRates = async (currency) => {
  if (!currency) {
    throw new Error("Missing required 'currency' parameter");
  }

  try {
    // calls coinbase service to fetch data
    const data = await fetchDataFromCoinbase(
      process.env.COINBASE_API_EXCHANGE_PATH,
      { currency }
    );

    return data.data.rates;
  } catch (error) {
    // Additional error handling would go here, for now this is handled by the controller try/catch
    throw error;
  }
};

// fetches exchange rate between two provided currency codes
export const fetchExchangeRate = async (from, to) => {
  if (!from || !to) {
    throw new Error("Missing required 'from' or 'to' parameters");
  }

  try {
    // fetches all exchange rates for given 'from' country code
    const exchangeRates = await fetchExchangeRates(from);

    // returns only the exchange rate for the given 'to' country code
    return exchangeRates[to];
  } catch (error) {
    // Additional error handling would go here, for now this is handled by the controller try/catch
    throw error;
  }
};

// fetches all currency codes supported by coinbase api
// uses redis for caching the data for 6 hours as the data does not change often
// however new coins may be added at any time so our app will never be more than 6 hours behind a new coin being added
export const fetchCurrencyCodes = async () => {
  try {
    // search for the cached value
    const cachedCodes = await redisClient.get(
      process.env.COINBASE_CURRENCY_CODES_CACHE_KEY
    );

    if (cachedCodes) {
      // if cached value exist, return the cached value
      return JSON.parse(cachedCodes);
    } else {
      // else fetch all fiat and crypto currencies and return a single array containing only the country codes as strings
      const fiatCurrencies = await fetchDataFromCoinbase(
        process.env.COINBASE_API_CURRENCIES_PATH
      );

      const cryptoCurrencies = await fetchDataFromCoinbase(
        process.env.COINBASE_API_CRYPTOCURRENCIES_PATH
      );

      const fiatCurrencyCodes = fiatCurrencies.data.map(({ id }) => id);
      const cryptoCurrencyCodes = cryptoCurrencies.data.map(({ code }) => code);

      const combinedCurrencyCodes = [
        ...fiatCurrencyCodes,
        ...cryptoCurrencyCodes,
      ];

      await redisClient.set(
        process.env.COINBASE_CURRENCY_CODES_CACHE_KEY,
        JSON.stringify(combinedCurrencyCodes),
        { EX: process.env.COINBASE_CURRENCY_CODES_CACHE_EXPIRY_SECONDS } // expire cached value after 6 hours to handle new cryptocurrencies
      );

      return combinedCurrencyCodes;
    }
  } catch (error) {
    // Additional error handling would go here, for now this is handled by the controller try/catch
    throw error;
  }
};

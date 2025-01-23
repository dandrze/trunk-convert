import supertest from "supertest";
import nock from "nock";
import mockingoose from "mockingoose";
import app from "../index.js";
import User from "../src/models/user.model.js";
import Request from "../src/models/request.model.js";

const TOKEN = "test-api-key";

// mocks coinbase api /v2/exchange-rates endpoint
nock(process.env.COINBASE_API_BASE)
  .persist()
  .get(process.env.COINBASE_API_EXCHANGE_PATH)
  .query({ currency: "USD" })
  .reply(200, {
    data: {
      currency: "USD",
      rates: {
        USD: 1,
        EUR: 0.855,
      },
    },
  });

// mocks coinbase api /v2/currencies endpoint
nock(process.env.COINBASE_API_BASE)
  .persist()
  .get(process.env.COINBASE_API_CURRENCIES_PATH)
  .reply(200, {
    data: [
      {
        id: "USD",
        name: "United States Dollar",
      },
      {
        id: "EUR",
        name: "Euro",
      },
    ],
  });

// mocks coinbase api /v2/currencies/crypto endpoint
nock(process.env.COINBASE_API_BASE)
  .persist()
  .get(process.env.COINBASE_API_CRYPTOCURRENCIES_PATH)
  .reply(200, {
    data: [
      {
        code: "BTC",
        name: "Bitcoin",
      },
      {
        code: "ETH",
        name: "Ethereum",
      },
    ],
  });

// mocks mongodb user and request models
const mockUser = { apiKey: TOKEN };
mockingoose(User).toReturn(mockUser, "findOne");
mockingoose(Request).toReturn(null, "save");

describe("GET /api/v1/conversion", () => {
  it("should return 200 and the converted amount", async () => {
    // mock 0 requests in the database to not trigger request limit
    mockingoose(Request).toReturn(0, "countDocuments");

    const response = await supertest(app)
      .get("/api/v1/conversion?from=USD&to=EUR&amount=100")
      .set("Authorization", `Bearer ${TOKEN}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      from: "USD",
      to: "EUR",
      amount: 100,
      convertedAmount: 85.5,
    });
  });

  it("should return 400 and a message for missing query parameters", async () => {
    // mock 0 requests in the database to not trigger request limit
    mockingoose(Request).toReturn(0, "countDocuments");

    const response = await supertest(app)
      .get("/api/v1/conversion?from=USD&to=EUR")
      .set("Authorization", `Bearer ${TOKEN}`);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: "Missing 'amount' query parameter",
    });
  });

  it("should return 400 and a message for invalid 'from' currency codes", async () => {
    // mock 0 requests in the database to not trigger request limit
    mockingoose(Request).toReturn(0, "countDocuments");

    const response = await supertest(app)
      .get("/api/v1/conversion?from=US&to=EUR&amount=100")
      .set("Authorization", `Bearer ${TOKEN}`);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: "Invalid 'from' currency code",
    });
  });

  it("should return 400 and a message for invalid 'to' currency codes", async () => {
    // mock 0 requests in the database to not trigger request limit
    mockingoose(Request).toReturn(0, "countDocuments");

    const response = await supertest(app)
      .get("/api/v1/conversion?from=USD&to=EU&amount=100")
      .set("Authorization", `Bearer ${TOKEN}`);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: "Invalid 'to' currency code",
    });
  });

  it("should return 400 and a message for invalid amount", async () => {
    // mock 0 requests in the database to not trigger request limit
    mockingoose(Request).toReturn(0, "countDocuments");

    const response = await supertest(app)
      .get("/api/v1/conversion?from=USD&to=EUR&amount=one hundred")
      .set("Authorization", `Bearer ${TOKEN}`);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: "'amount' query parameter must be a number",
    });
  });

  it("should return 400 and a message for invalid amount", async () => {
    // mock 0 requests in the database to not trigger request limit
    mockingoose(Request).toReturn(0, "countDocuments");

    const response = await supertest(app)
      .get("/api/v1/conversion?from=USD&to=EUR&amount=one hundred")
      .set("Authorization", `Bearer ${TOKEN}`);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: "'amount' query parameter must be a number",
    });
  });

  it("should return 429 when the daily limit has been reached", async () => {
    // mock 200 requests in the database to trigger request limit
    // for now we are only testing that the limit works
    // for completeness, a date would be mocked to force the system to a weekday or weekend to test both scenarios
    mockingoose(Request).toReturn(200, "countDocuments");

    const response = await supertest(app)
      .get("/api/v1/conversion?from=USD&to=EUR&amount=100")
      .set("Authorization", `Bearer ${TOKEN}`);

    expect(response.status).toBe(429);
    expect(response.body).toEqual({
      message: "Request limit exceeded for today.",
    });
  });
});

afterAll((done) => {
  done();
});

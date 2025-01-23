# Trunk Tools Assessment

Thank you for taking the time to review this assessment. Here are some additional details that could help reviewing this app easier.

Build localling using this command: `npm run build`
Run locally using the command: `npm run dev`
Run tests using the command: `npm run test`

# Api Documentation

Swagger API documentation can be found at `/api-docs`

# Demo user

There is a demo endpoint ( `POST /api/demo-use` ) which returns the body:

    {
        "message":  "User created successfully",
        "apiKey":  "4e637fde-2362-4c1f-912f-0c488b3ec623"
    }

the `apiKey` can be used to generate a dummy user with a token to provide in the Authorization header in requests to `GET /api/v1/conversion`
i.e. `Authorization: Bearer 4e637fde-2362-4c1f-912f-0c488b3ec623`

# Decisions made during design

**Database**

I chose MongoDB for the database because the request parameters and body could change over time, making them better suited for noSQL. The alternative could be to either to store JSON in SQL for these two pieces of data, or add additional table rows to SQL if these change. Neither alternative seemed feasible.

**Authentication**

I used the `passport` library for this because it's what I used in the past and have always had a good experience with it. It can handle any authentication method (social sign in, username password, etc.) so it can grow with the app if needed.

**Route validation**

`/api/v1/conversion` checks to make sure to, from, and amount are included as params, and returns an error object if one is missing:

    {
        "message": "Missing 'from' query parameter"
    }

The endpoint also checks to make sure to and from are valid currency codes supported by Coinbase. In a real life scenario I would first check to confirm if we want to provide any validation here before implementing this. The alternative would be to rely on the coinbase behaviour which is to simply return a converted value of null. However for this assessment I went ahead with the validation because I thought it would be a good excuse to throw in some optimization with a redis cache. The function `fetchCurrencyCodes() ` is cached with redis using a TTL of 6 hours to make sure this api has access to the latest and greatest memecoins.

**Additional features**

This app still has more that can be added but I decided to stop it here as it should offer enough to review without the app growing to be dozens of files and thousands of lines.

To make this production ready it still needs:

- Unit testing, especially on coinbase.service.js functions
- Proper authentication and more fields in the User model
- Improved error handling. Currently thrown app error messages are being sent back to the user.
- A CI pipeline that uses the tests
- Deployment to a cloud server

// Copyright The Linux Foundation and each contributor to LFX.
// SPDX-License-Identifier: MIT

const cubejs = require("@cubejs-client/core");
// const sign = require("jwt-encode");
// Defined as CUBEJS_API_SECRET=secret1234
// const secret = "secret1234";
// const data = {
//   appID: `transactions`,
//   iat: parseInt(new Date().getTime() / 1000 + 60 * 60),
// };
// const jwt = sign(data, secret);

const cubejsApi = new cubejs.CubejsApi("token", {
  apiUrl: "http://localhost:4000/cubejs-api/v1",
});

module.exports = { cubejsApi };

const getBaseHeaders = token => {
  let headers = {
    "Content-Type": "application/json"
  };

  if (token) {
    headers["x-auth-token"] = token;
  }

  return headers;
};

export default getBaseHeaders;

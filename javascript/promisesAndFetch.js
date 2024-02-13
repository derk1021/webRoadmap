// PROMISES
function makeRequest(website) {
  return new Promise((resolve, reject) => {
    console.log("Beginning of request made...");
    if (website == "Facebook") {
      resolve("The request is to Facebook!");
    } else {
      reject("The request must be made to Facebook!");
    }
  });
}

function parseRequest(response) {
  console.log("Parsing response...");
  return new Promise((resolve) => {
    resolve(`Info: ${response}`);
  });
}

function callPromise() {
  makeRequest("Facebook")
    .then((resp) => {
      console.log("Response received!");
      return parseRequest(resp);
    })
    .then((parsedReqRes) => {
      // Use another .then() chain to get another resulting promise returned (i.e. parsedRequest)
      console.log(parsedReqRes);
    })
    .catch((err) => {
      console.log(err);
    });
}
// callPromise();

// ASYNC-AWAIT
// How can we use async-await to simplify the calling of promises above?
async function callingPromise() {
  try {
    let response = await makeRequest("Facebook");
    console.log("Response received!");
    let parsing = await parseRequest(response);
    console.log(parsing);
  } catch (err) {
    console.log(err);
  }
}
// callingPromise();

// FETCH
fetch("https://reqres.in/ap", {
  method: "GET", // Post
  // headers: {
  //   "Content-Type": "application/json",
  // },
  // body: JSON.stringify({
  //   name: "User 1",
  // }),
})
  .then((res) => {
    // fetch always returns a promise first, so you must return it in json
    if (res.ok) {
      console.log("SUCCESS");
      return res.json();
    } else {
      console.log("FAILED");
      return res.status;
    }
  })
  .then((response) => {
    // since the result is turned into json, we can work with it
    console.log(response);
    // console.log(response.data);
  })
  .catch((err) => {
    console.log("Error message:", err);
  });

/**
 * The `registerStudent` function handles form submission, sends the form data to an API endpoint, and
 * updates the UI based on the response.
 * @param e - The `e` parameter in the `registerStudent` function is typically an event object,
 * commonly used in event handling functions in JavaScript. In this case, it is likely representing a
 * form submission event, as the function is designed to handle form submissions for registering a
 * student. The function prevents the default form
 */
function registerStudent(e) {
  e.preventDefault();

  document.getElementById("submitSignUp").innerText = "Loading...";

  const formData = new FormData(e.target);
  const data = {};
  for (let [key, value] of formData.entries()) {
    data[key] = value;
  }

  console.log("Data passed!:", data);

  // Post form data to endpoint
  fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((res) => {
      document.getElementById("submitSignUp").innerText = "Sign Up";
      console.log("Success:", res);

      if (res.status === "error") {
        document.getElementById("signUpMessage").innerHTML = res.message;
        document.getElementById("signUpMessage").style.display = "block";
      } else {
        document.getElementById("signUpMessage").innerHTML = res.message;
        document.getElementById("signUpMessage").style.display = "block";
        document.getElementById("signUpMessage").style.backgroundColor =
          "green";
        //   document.getElementById("signUpMessage").requestFullscreen
      }
    })
    .catch((error) => {
      document.getElementById("submitSignUp").innerText = "Sign Up";
      console.error("Error:", error);
      document.getElementById("signUpMessage").innerHTML = error.message;
      document.getElementById("signUpMessage").style.display = "block";
    });
}

function studentLogin(e) {
  e.preventDefault();

  document.getElementById("submitSignIn").innerText = "Loading...";

  const formData = new FormData(e.target);
  const data = {};
  for (let [key, value] of formData.entries()) {
    data[key] = value;
  }

  console.log("Data passed!:", data);

  // Post form data to endpoint
  fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((res) => {
      document.getElementById("submitSignIn").innerText = "Sign In";
      if (res.status === "error") {
        document.getElementById("signInMessage").innerHTML = res.message;
        document.getElementById("signInMessage").style.display = "block";
      } else {
        console.log("Success:", res.data);
        saveAsCookie(res.data.token);
        document.getElementById("signInMessage").innerHTML =
          res.message + `, Redirecting...`;
        document.getElementById("signInMessage").style.display = "block";
        document.getElementById("signInMessage").style.backgroundColor =
          "green";
        setTimeout(() => {
          window.location.href = "./dashboard";
        }, 1000);
      }
    })
    .catch((error) => {
      document.getElementById("submitSignIn").innerText = "Sign In";
      console.error("Error:", error);
      document.getElementById("signInMessage").innerHTML = error.message;
      document.getElementById("signInMessage").style.display = "block";
    });
}

/**
 * The function `saveAsCookie` saves a token as a cookie with an expiration time of 1 hour.
 * @param token - The `token` parameter in the `saveAsCookie` function is a unique identifier or
 * authentication token that you want to store in a cookie. This token is typically used for
 * authentication purposes or to remember a user's session information.
 */
function saveAsCookie(token) {
  const now = new Date();
  const expirationTime = new Date(now.getTime() + 60 * 60 * 1000);
  const cookieString = `token=${token}; expires=${expirationTime.toUTCString()}; path=/`;
  document.cookie = cookieString;
}


function adminSaveAsCookie(token) {
  const now = new Date();
  const expirationTime = new Date(now.getTime() + 60 * 60 * 1000);
  const cookieString = `adminToken=${token}; expires=${expirationTime.toUTCString()}; path=/`;
  document.cookie = cookieString;
}

async function adminLogin(e) {
  e.preventDefault();

  document.getElementById("submitAdminLogin").innerText = "Processing...";

  const formData = new FormData(e.target);
  const data = {};
  for (let [key, value] of formData.entries()) {
    data[key] = value;
  }

  console.log("Data passed!:", data);

  fetch(`${BASE_URL}/api/admin/login`, {
    method: 'POST',
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  }).then((response) => response.json())
    .then((res) => {
      console.log(res)
      document.getElementById("submitAdminLogin").innerText = "Sign In";

      if (res.status === "error") {
        document.getElementById("adminLoginMessageBox").innerText = res.message;
        document.getElementById("adminLoginMessageBox").style.backgroundColor = "#d10808";
        document.getElementById("adminLoginMessageBox").style.color = "#e6c0c0";
        document.getElementById("adminLoginMessageBox").style.display = "block";
      } else {
        adminSaveAsCookie(res.data.token);
        document.getElementById("adminLoginMessageBox").innerHTML =
          res.message + `, Redirecting...`;
        document.getElementById("adminLoginMessageBox").style.backgroundColor = "#1a791a";
        document.getElementById("adminLoginMessageBox").style.color = "#ebf0eb";
        document.getElementById("adminLoginMessageBox").style.display = "block";
        setTimeout(() => {
          window.location.href = "../admin/users.html";
        }, 1000);
      }
    })
    .catch((error) => {
      document.getElementById("submitAdminLogin").innerText = "Sign In";
      console.error("Error:", error)
    })
}
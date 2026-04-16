/**
 * The JavaScript code provided includes functions to authenticate a user using a token stored in a
 * cookie, verify the token with a server endpoint, and logout by clearing the token cookie.
 */
var token = getCookie("token");
function authenticate() {
  // get token cookie and validate
  // console.log("This is the authorization token:", token);

  if (token == "" || token == undefined || token == null) {
    window.location.href = "../authenticate.html";
  } else {
    verifyToken(token);
  }
}

function getCookie(item) {
  var name = item + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function setUserDisplayName(fullName) {
  function apply() {
    var el = document.getElementById("userFullName");
    if (el && fullName) {
      el.textContent = fullName;
    }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", apply);
  } else {
    apply();
  }
}

function verifyToken(token) {
  fetch(`${BASE_URL}/api/auth/verify-token`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then((res) => {
      if (res.status === "error") {
        window.location.href = "../authenticate.html";
        return;
      }
      if (res.data && res.data.fullName) {
        setUserDisplayName(res.data.fullName);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      window.location.href = "../authenticate.html";
    });
}

function logout() {
  document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  window.location.href = "./";
}

authenticate();

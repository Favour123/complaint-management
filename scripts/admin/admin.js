/**
 * The above functions use async/await to fetch all users and delete a user from a database, handling
 * errors and displaying appropriate messages.
 * @returns In the `getAllUsers` function, the fetched data is returned if the response status is
 * "success". In the `deleteUser` function, an alert message is returned if the user is deleted
 * successfully.
 */
function getCookieValue(name) {
  var nameEq = name + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") c = c.substring(1);
    if (c.indexOf(nameEq) == 0) return c.substring(nameEq.length, c.length);
  }
  return "";
}

function adminAuthHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: "Bearer " + getCookieValue("adminToken"),
  };
}

async function getAllUsers() {
  try {
    const response = await fetch(`${BASE_URL}/api/admin/users`, {
      headers: adminAuthHeaders(),
    });
    const res = await response.json();

    if (res.status === "success") {
      return res.data; // Return the fetched data
    } else {
      throw new Error(res.message);
    }
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}

// function to delete user from database
async function deleteUser(userId) {
  try {
    const response = await fetch(`${BASE_URL}/api/admin/user/${userId}`, {
      method: "DELETE",
      headers: adminAuthHeaders(),
    });

    if (response.status === 204) {
      return alert("User deleted successfully\n Please reload the page.");
    } else {
      throw new Error("Unable to delete user");
    }
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}

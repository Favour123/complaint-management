/**
 * The above functions handle submitting complaints, fetching complaint history, viewing complaint
 * details, fetching all complaints, and updating complaint status asynchronously.
 * @param e - The `e` parameter in the `submitComplaints` function is typically an event object,
 * commonly used in event handling functions in JavaScript. It represents the event that occurred, such
 * as a form submission in this case. By calling `e.preventDefault()`, the default behavior of the
 * event (in
 */
// No selected code provided, so I'll suggest a general improvement for the entire code file

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

/** Prefer admin JWT on admin pages; otherwise student token from auth.js */
function clientAuthBearer() {
  var admin = getCookieValue("adminToken");
  if (admin) return admin;
  return typeof token !== "undefined" ? token : "";
}

// Extract a function to handle API requests
async function apiRequest(url, method, headers, body) {
  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
    });
    const res = await response.json();
    return res;
  } catch (error) {
    console.error("Error:", error);
    return { status: "error", message: error.message };
  }
}

// Use the extracted function in other functions
function submitComplaints(e) {
  e.preventDefault();

  document.getElementById("submitComplaintBtn").innerText = "Please Wait...";

  const formData = new FormData(e.target);
  const data = {};
  for (let [key, value] of formData.entries()) {
    data[key] = value;
  }

  console.log("Data passed!:", data);

  // Post form data to endpoint
  apiRequest(
    `${BASE_URL}/api/complaints/submit`,
    "POST",
    {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    data
  )
    .then((res) => {
      document.getElementById("submitComplaintBtn").innerText = "Submit";
      console.log("Success:", res.data);

      if (res.status === "error") {
        document.getElementById("messageBox").innerHTML = res.message;
        document.getElementById("messageBox").style.display = "block";
      } else {
        document.getElementById("messageBox").innerHTML = res.message;
        document.getElementById("messageBox").style.display = "block";
        document.getElementById("messageBox").style.backgroundColor = "green";
      }
    })
    .catch((error) => {
      document.getElementById("submitComplaintBtn").innerText = "Submit";
      console.error("Error:", error);
      document.getElementById("messageBox").innerHTML = error.message;
      document.getElementById("messageBox").style.display = "block";
    });
}

async function complaintHistory() {
  try {
    const response = await apiRequest(
      `${BASE_URL}/api/complaints/user`,
      "GET",
      {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      }
    );
    return response;
  } catch (error) {
    console.error("Error:", error);
    return { status: "error", message: error.message };
  }
}

function viewComplaint(uuid) {
  openPopup();

  // store uuid in localstorage
  localStorage.setItem("complaintUUID", uuid);

  // Get complaint details from endpoint
  apiRequest(`${BASE_URL}/api/complaints/${uuid}`, "GET", {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  })
    .then((res) => {
      if (res.status === "error") {
        return alert("An error occured");
      }
      console.log(res);
      const complaintDetails = res.data;
      // render the resolve button conditionally
      if (complaintDetails.complaint_status === "Pending") {
        document.getElementById("updateStatusBtn").style.display = "block";
      }

      document.getElementById("detailsDiv").innerHTML = `
      <h2 id="detailsTitle">${complaintDetails.complaint_title}</h2>
          <h5 id="detailsCategory" style="margin-bottom:8px;">${complaintDetails.complaint_type}</h5>
          <p id="detailsBody" style="text-align:justify;">${complaintDetails.complaint_body}</p>
      `;
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

async function AllComplaint() {
  try {
    const response = await apiRequest(
      `${BASE_URL}/api/admin/get-complaints`,
      "GET",
      {
        "Content-Type": "application/json",
      }
    );
    return response;
  } catch (error) {
    console.error("Error:", error);
    return { status: "error", message: error.message };
  }
}

async function updateComplaint() {
  // get complaintUUid from localstorage

  const uuid = localStorage.getItem("complaintUUID");

  if (uuid !== null) {
    try {
      const response = await apiRequest(
        `${BASE_URL}/api/admin/complaints/update/${uuid}`,
        "PUT",
        {
          "Content-Type": "application/json",
        },
        { status: "Resolved" }
      );

      const res = await response.json();

      // remove UUID from local storage
      localStorage.removeItem("complaintUUID");
      alert(res.message + "\n Please Reload the page...");
      return (window.location = "./dashboard.html");
    } catch (error) {
      return console.error(error);
    }
  }
  return console.log("Unable to get UUID");
}
function submitComplaints(e) {
  e.preventDefault();

  document.getElementById("submitComplaintBtn").innerText = "Please Wait...";

  const formData = new FormData(e.target);
  const data = {};
  for (let [key, value] of formData.entries()) {
    data[key] = value;
  }

  console.log("Data passed!:", data);

  // Post form data to endpoint
  fetch(`${BASE_URL}/api/complaints/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((res) => {
      document.getElementById("submitComplaintBtn").innerText = "Submit";
      console.log("Success:", res.data);

      if (res.status === "error") {
        document.getElementById("messageBox").innerHTML = res.message;
        document.getElementById("messageBox").style.display = "block";
      } else {
        document.getElementById("messageBox").innerHTML = res.message;
        document.getElementById("messageBox").style.display = "block";
        document.getElementById("messageBox").style.backgroundColor = "green";
        //   document.getElementById("messageBox").requestFullscreen
      }
    })
    .catch((error) => {
      document.getElementById("submitComplaintBtn").innerText = "Submit";
      console.error("Error:", error);
      document.getElementById("messageBox").innerHTML = error.message;
      document.getElementById("messageBox").style.display = "block";
    });
}

// function complaintHistory() {
//   // Get complaint history from endpoint
//   fetch(`${BASE_URL}/api/complaints/user`, {
//     method: "GET",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${token}`,
//     },
//   })
//     .then((response) => response.json())
//     .then((res) => {
//       if (res.status === "error") {
//         document.getElementById("historyMessageBox").innerHTML = res.message;
//         document.getElementById("historyMessageBox").style.display = "block";
//         return;
//       }

//       console.log("Success:", res.data);

//       const complaintsTable = document.getElementById("complaintTable");
//       let count = 1; // Start count from 1
//       complaintsTable.innerHTML = ""; // Clear existing rows

//   res.data.forEach((complaint) => {
//     const row = `
//         <tr>
//           <td>${count++}</td>
//           <td>${complaint.complaint_type}</td>
//           <td>${complaint.faculty}</td>
//           <td>${complaint.complaint_title}</td>
//           <td>${complaint.complaint_status}</td>
//           <td>${new Date(complaint.createdAt).toLocaleString()}</td>
//           <td><a onclick="viewComplaint('${
//             complaint.uuid
//           }')" id="togglePopup" class="view-details" style="cursor:pointer;text-decoration:none;">View</a></td>
//         </tr>
//       `;
//     complaintsTable.innerHTML += row; // Append each row
//   });
//     })
//     .catch((error) => {
//       console.error("Error:", error);
//       document.getElementById("historyMessageBox").innerHTML = error.message;
//       document.getElementById("historyMessageBox").style.display = "block";
//     });
// }

async function complaintHistory() {
  try {
    const response = await fetch(`${BASE_URL}/api/complaints/user`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const res = await response.json();

    // If response status is error, return early
    if (res.status === "error") {
      return {
        status: "error",
        message: res.message,
      };
    }

    // Return the success response with data
    return {
      status: "success",
      data: res.data,
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      status: "error",
      message: error.message,
    };
  }
}

function viewComplaint(uuid) {
  openPopup();

  // store uuid in localstorage
  localStorage.setItem("complaintUUID", uuid);

  // Get complaint details from endpoint
  fetch(`${BASE_URL}/api/complaints/${uuid}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${clientAuthBearer()}`,
    },
  })
    .then((response) => response.json())
    .then((res) => {
      if (res.status === "error") {
        return alert("An error occured");
      }
      console.log(res);
      const complaintDetails = res.data;
      // render the resolve button conditionally
      if (complaintDetails.complaint_status === "Pending") {
        document.getElementById("updateStatusBtn").style.display = "block";
      }

      document.getElementById("detailsDiv").innerHTML = `
      <h2 id="detailsTitle">${complaintDetails.complaint_title}</h2>
          <h5 id="detailsCategory" style="margin-bottom:8px;">${complaintDetails.complaint_type}</h5>
          <p id="detailsBody" style="text-align:justify;">${complaintDetails.complaint_body}</p>
      `;
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

async function AllComplaint() {
  try {
    const response = await fetch(`${BASE_URL}/api/admin/get-complaints`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${clientAuthBearer()}`,
      },
    });

    const res = await response.json();

    // If response status is error, return early
    if (res.status === "error") {
      return {
        status: "error",
        message: res.message,
      };
    }

    // Return the success response with data
    return {
      status: "success",
      data: res.data,
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      status: "error",
      message: error.message,
    };
  }
}

async function updateComplaint() {
  // get complaintUUid from localstorage

  const uuid = localStorage.getItem("complaintUUID");

  if (uuid !== null) {
    try {
      const response = await fetch(
        `${BASE_URL}/api/admin/complaints/update/${uuid}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookieValue("adminToken")}`,
          },
          body: JSON.stringify({
            status: "Resolved",
          }),
        }
      );

      const res = await response.json();

      // remove UUID from local storage
      localStorage.removeItem("complaintUUID");
      alert(res.message + "\n Please Reload the page...");
      return (window.location = "./dashboard.html");
    } catch (error) {
      return console.error(error);
    }
  }
  return console.log("Unable to get UUID");
}

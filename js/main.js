document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const phone = document.getElementById("phone").value.trim();
    const location = document.getElementById("location").value.trim();
    const bloodGroup = document.getElementById("bloodGroup").value;

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email, password, phone, location, bloodGroup })
      });

      const data = await res.json();

      if (res.ok) {
        alert("Registration successful!");
        window.location.href = "login.html";
      } else {
        alert(data.message || "Registration failed.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to connect to server.");
    }
  });
});


// js/login.js
document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      // Save token to localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      alert("Login successful!");
      window.location.href = "dashboard.html"; // Redirect
    } else {
      alert(data.message || "Login failed.");
    }
  } catch (err) {
    alert("Error connecting to server.");
    console.error(err);
  }
});

// js/dashboard.js

document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    alert("Please log in first.");
    window.location.href = "login.html";
    return;
  }

  document.getElementById("username").textContent = user.name;

  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    alert("Logged out successfully.");
    window.location.href = "login.html";
  });
});
// js/requests.js
document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const logoutBtn = document.getElementById("logoutBtn");

  if (!token) {
    alert("Please login first.");
    window.location.href = "login.html";
    return;
  }

  logoutBtn.addEventListener("click", () => {
    localStorage.clear();
    alert("Logged out successfully.");
    window.location.href = "login.html";
  });

  const requestList = document.getElementById("requestList");

  try {
    const res = await fetch("http://localhost:5000/api/requests", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();
    console.log("📦 Fetched Requests:", data); // ✅ Debug output

    if (res.ok && data.length > 0) {
      requestList.innerHTML = "";

      data.forEach((req) => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
          <h3>${req.patientName}</h3>
          <p><strong>Blood Group:</strong> ${req.bloodGroupNeeded}</p>
          <p><strong>Urgency:</strong> ${req.urgency || "Not specified"}</p>
          <p><strong>Location:</strong> ${req.location}</p>
          <p><strong>Date Required:</strong> ${new Date(req.requiredDate).toLocaleDateString()}</p>
          ${req.reason ? `<p><strong>Reason:</strong> ${req.reason}</p>` : ""}
          ${req.userId ? `<p><strong>Contact:</strong> ${req.userId.name} (${req.userId.phone})</p>` : ""}
        `;
        requestList.appendChild(card);
      });
    } else {
      requestList.innerHTML = "<p>No blood requests found.</p>";
    }
  } catch (err) {
    console.error("❌ Error fetching requests:", err);
    requestList.innerHTML = "<p>Server error. Please try again later.</p>";
  }
});


// js/post-request.js
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!token || !user) {
    alert("Please login first.");
    window.location.href = "login.html";
    return;
  }

  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.clear();
    alert("Logged out successfully.");
    window.location.href = "login.html";
  });

  const form = document.getElementById("requestForm");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const body = {
      patientName: document.getElementById("patientName").value,
      hospital: document.getElementById("hospital").value,
      location: document.getElementById("location").value,
      bloodGroup: document.getElementById("bloodGroup").value,
      units: document.getElementById("units").value,
      requiredDate: document.getElementById("requiredDate").value,
      reason: document.getElementById("reason").value,
    };

    try {
      const res = await fetch("http://localhost:5000/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Request posted successfully!");
        window.location.href = "requests.html";
      } else {
        alert(data.message || "Failed to post request.");
      }
    } catch (err) {
      console.error(err);
      alert("Server error.");
    }
  });
});


// js/donor.js

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const logoutBtn = document.getElementById("logoutBtn");

  if (!token) {
    alert("Please login first.");
    window.location.href = "login.html";
    return;
  }

  logoutBtn.addEventListener("click", () => {
    localStorage.clear();
    alert("Logged out successfully.");
    window.location.href = "login.html";
  });

  const donorList = document.getElementById("donorList");

  try {
    const res = await fetch("http://localhost:5000/api/users", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (res.ok && data.length > 0) {
      donorList.innerHTML = "";

      data.forEach((donor) => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
          <h3>${donor.name}</h3>
          <p><strong>Blood Group:</strong> ${donor.bloodGroup}</p>
          <p><strong>Location:</strong> ${donor.location}</p>
          <p><strong>Phone:</strong> ${donor.phone}</p>
          <p><strong>Email:</strong> ${donor.email}</p>
        `;
        donorList.appendChild(card);
      });
    } else {
      donorList.innerHTML = "<p>No donors found.</p>";
    }
  } catch (err) {
    console.error(err);
    donorList.innerHTML = "<p>Server error. Please try again later.</p>";
  }
});

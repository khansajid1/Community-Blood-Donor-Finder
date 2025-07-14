document.addEventListener("DOMContentLoaded", () => {

  // ========== Registration ==========
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
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
        const res = await fetch("https://community-blood-donor-finder-backend.onrender.com/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, phone, location, bloodGroup })
        });
        const data = await res.json();
        if (res.ok) {
          alert("Registration successful!");
          window.location.href = "login.html";
        } else {
          alert(data.message || "Registration failed.");
        }
      } catch (err) {
        alert("Server error.");
      }
    });
  }

  // ========== Login ==========
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      try {
        const res = await fetch("https://community-blood-donor-finder-backend.onrender.com/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (res.ok && data.token) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          alert("Login successful!");
          window.location.href = "dashboard.html";
        } else {
          alert(data.message || "Login failed.");
        }
      } catch (err) {
        alert("Server error.");
      }
    });
  }

  // ========== Dashboard ==========
  const usernameSpan = document.getElementById("username");
  if (usernameSpan) {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.name) {
      alert("Please log in first.");
      localStorage.clear();
      window.location.href = "login.html";
      return;
    }
    usernameSpan.textContent = user.name;
  }

  // ========== Logout Button ==========
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.clear();
      alert("Logged out successfully.");
      window.location.href = "login.html";
    });
  }

  // ========== View Requests ==========
  const requestList = document.getElementById("requestList");
  if (requestList) {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first.");
      window.location.href = "login.html";
      return;
    }

    fetch("https://community-blood-donor-finder-backend.onrender.com/api/requests", {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      requestList.innerHTML = "";
      if (data.length > 0) {
        data.forEach(req => {
          const card = document.createElement("div");
          card.className = "card request-card";
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
    })
    .catch(err => {
      requestList.innerHTML = "<p>Server error. Please try again later.</p>";
    });
  }

  // ========== Post Request ==========
  const requestForm = document.getElementById("requestForm");
  if (requestForm) {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first.");
      window.location.href = "login.html";
      return;
    }

    requestForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const body = {
        patientName: document.getElementById("patientName").value.trim(),
        bloodGroupNeeded: document.getElementById("bloodGroup").value,
        urgency: "High",
        location: document.getElementById("location").value.trim()
      };

      try {
        const res = await fetch("https://community-blood-donor-finder-backend.onrender.com/api/requests", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(body)
        });
        const data = await res.json();
        if (res.ok) {
          alert("Request posted successfully!");
          window.location.href = "requests.html";
        } else {
          alert(data.message || "Failed to post request.");
        }
      } catch (err) {
        alert("Server error.");
      }
    });
  }

  // ========== Donor List ==========
  const donorList = document.getElementById("donorList");
  if (donorList) {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first.");
      window.location.href = "login.html";
      return;
    }

    fetch("https://community-blood-donor-finder-backend.onrender.com/api/users", {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      donorList.innerHTML = "";
      if (data.length > 0) {
        data.forEach(donor => {
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
    })
    .catch(err => {
      donorList.innerHTML = "<p>Server error. Please try again later.</p>";
    });
  }
});

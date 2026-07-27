const studentTable = document.getElementById("studentTable");
const studentForm = document.getElementById("studentForm");

const API_BASE = window.location.protocol === "file:" ? "http://localhost:3000" : "";

let students = [];

async function loadStudents() {
  try {
    const res = await fetch(`${API_BASE}/api/students`);
    if (res.ok) {
      students = await res.json();
      renderTable();
    } else {
      console.error("Failed to load students");
    }
  } catch (err) {
    console.error("Error loading students:", err);
  }
}

function renderTable() {
  studentTable.innerHTML = "";
  if (students.length === 0) {
    studentTable.innerHTML = `<tr><td colspan="7" style="text-align:center;">No students found in database.</td></tr>`;
    return;
  }
  students.forEach((s) => {
    const total = s.total > 0 ? s.total : 1;
    const percent = ((s.attended / total) * 100).toFixed(2);
    studentTable.innerHTML += `<tr>
      <td>${escapeHtml(s.roll)}</td>
      <td>${escapeHtml(s.name)}</td>
      <td>${escapeHtml(s.course)}</td>
      <td>${s.attended}</td>
      <td>${s.total}</td>
      <td>${percent}%</td>
      <td>
        <button class="edit-btn" onclick="editAttendance(${s.id}, ${s.attended}, ${s.total})">Edit</button>
        <button class="delete-btn" onclick="deleteStudent(${s.id})">Delete</button>
      </td>
    </tr>`;
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

studentForm.addEventListener("submit", async e => {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const roll = document.getElementById("roll").value.trim();
  const course = document.getElementById("course").value.trim();
  const attended = parseInt(document.getElementById("attended").value);
  const total = parseInt(document.getElementById("total").value);

  try {
    const res = await fetch(`${API_BASE}/api/students`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, roll, course, attended, total })
    });

    const data = await res.json();
    if (res.ok) {
      studentForm.reset();
      await loadStudents();
    } else {
      alert(data.error || "Failed to add student.");
    }
  } catch (err) {
    console.error("Error adding student:", err);
    alert("Server error when adding student. Make sure backend server (server.js) is running.");
  }
});

async function deleteStudent(id) {
  if (confirm("Delete this student from database?")) {
    try {
      const res = await fetch(`${API_BASE}/api/students/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        await loadStudents();
      } else {
        alert(data.error || "Failed to delete student.");
      }
    } catch (err) {
      console.error("Error deleting student:", err);
      alert("Server error when deleting student.");
    }
  }
}

async function editAttendance(id, currentAttended, currentTotal) {
  const attendedInput = prompt("Classes Attended:", currentAttended);
  if (attendedInput === null) return;
  const totalInput = prompt("Total Classes:", currentTotal);
  if (totalInput === null) return;

  const attended = parseInt(attendedInput);
  const total = parseInt(totalInput);

  if (!isNaN(attended) && attended >= 0 && !isNaN(total) && total >= 1) {
    try {
      const res = await fetch(`${API_BASE}/api/students/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attended, total })
      });

      const data = await res.json();
      if (res.ok) {
        await loadStudents();
      } else {
        alert(data.error || "Failed to update attendance.");
      }
    } catch (err) {
      console.error("Error updating attendance:", err);
      alert("Server error when updating attendance.");
    }
  } else {
    alert("Invalid input! Please enter valid non-negative numbers.");
  }
}

function logout() {
  window.location.href = "index.html";
}

window.editAttendance = editAttendance;
window.deleteStudent = deleteStudent;
window.logout = logout;

// Initial load
loadStudents();

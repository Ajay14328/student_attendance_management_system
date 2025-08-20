const studentTable = document.getElementById("studentTable");
const studentForm = document.getElementById("studentForm");

let students = JSON.parse(localStorage.getItem("students")) || [];

function renderTable() {
  studentTable.innerHTML = "";
  students.forEach((s,i)=>{
    const percent = ((s.attended / s.total) *100).toFixed(2);
    studentTable.innerHTML += `<tr>
      <td>${s.roll}</td>
      <td>${s.name}</td>
      <td>${s.course}</td>
      <td>${s.attended}</td>
      <td>${s.total}</td>
      <td>${percent}%</td>
      <td>
        <button class="edit-btn" onclick="editAttendance(${i})">Edit</button>
        <button class="delete-btn" onclick="deleteStudent(${i})">Delete</button>
      </td>
    </tr>`;
  });
}

studentForm.addEventListener("submit", e=>{
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const roll = document.getElementById("roll").value.trim();
  const course = document.getElementById("course").value.trim();
  const attended = parseInt(document.getElementById("attended").value);
  const total = parseInt(document.getElementById("total").value);

  students.push({name,roll,course,attended,total});
  localStorage.setItem("students",JSON.stringify(students));
  renderTable();
  studentForm.reset();
});

function deleteStudent(index) {
  if(confirm("Delete this student?")) {
    students.splice(index,1);
    localStorage.setItem("students",JSON.stringify(students));
    renderTable();
  }
}

function editAttendance(index){
  const attended = parseInt(prompt("Classes Attended:", students[index].attended));
  const total = parseInt(prompt("Total Classes:", students[index].total));
  if(!isNaN(attended) && attended>=0 && !isNaN(total) && total>=1){
    students[index].attended = attended;
    students[index].total = total;
    localStorage.setItem("students",JSON.stringify(students));
    renderTable();
  } else alert("Invalid numbers!");
}

function logout(){
  window.location.href = "login.html";
}

window.editAttendance = editAttendance;
window.deleteStudent = deleteStudent;

renderTable();

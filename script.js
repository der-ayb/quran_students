let db, SQL;
const DB_STORE_NAME = "sqlite-db2";
const DB_KEY = "mydb";
const dayDate = document.getElementById("dayDate");
let currentDay = new Date().toISOString().slice(0, 10);
dayDate.addEventListener("change", () => {
  if (dayDate.value) {
    currentDay = dayDate.value;
    loadDayStudentsList();
  }
});
const nameInput = $("#name");
const ageInput = $("#age");
const parentPhoneInput = $("#parentPhone");
const updateStudentBtn = $("<button>", {
  id: "updateStudentBtn",
  class: "btn btn-secondary mt-2",
  text: "تحديث",
});

function resetNewStudentsFields() {
  nameInput.val("");
  ageInput.val("");
  parentPhoneInput.val("");
  updateStudentBtn.off("click");
  updateStudentBtn.remove();
}

function update_day_module_moyenne(studentId) {
  if (!db) {
    alert("لا يوجد قاعدة بيانات مفتوحة.");
    return;
  }
  try {
    const modules = [
      { id: 1, selector: "#memorization" },
      { id: 2, selector: "#attendance" },
      { id: 3, selector: "#dressCode" },
      { id: 4, selector: "#haircut" },
      { id: 5, selector: "#behavior" },
      { id: 6, selector: "#prayer" },
    ];
    modules.forEach((mod) => {
      db.run(
        "INSERT OR REPLACE INTO day_module_moyenne (student_id, module_id, day, moyenne) VALUES (?, ?, ?, ?);",
        [studentId, mod.id, currentDay, $(mod.selector).val() || ""]
      );
    });
    saveToIndexedDB(db.export());
    loadDayStudentsList();
  } catch (e) {
    alert("Error: " + e.message);
  }
}

function loadDayStudentsList() {
  $("#dayListTable tbody").empty();
  if (!db) {
    $("#dayListTable tbody").append(
      "<tr><td colspan='3'>لا توجد معلومات.</td></tr>"
    );
    return;
  }
  try {
    const results = db.exec(`
      SELECT 
        s.id AS student_id,
        s.name AS student_name,
        MAX(CASE WHEN m.id = 1 THEN dmm.moyenne ELSE NULL END) AS "الحفظ",
        MAX(CASE WHEN m.id = 2 THEN dmm.moyenne ELSE NULL END) AS "الحظور",
        MAX(CASE WHEN m.id = 3 THEN dmm.moyenne ELSE NULL END) AS "الهندام",
        MAX(CASE WHEN m.id = 4 THEN dmm.moyenne ELSE NULL END) AS "الحلاقة",
        MAX(CASE WHEN m.id = 5 THEN dmm.moyenne ELSE NULL END) AS "السلوك",
        MAX(CASE WHEN m.id = 6 THEN dmm.moyenne ELSE NULL END) AS "الصلاة"
      FROM 
        students s
      CROSS JOIN 
        modules m
      LEFT JOIN 
        day_module_moyenne dmm ON s.id = dmm.student_id 
                  AND m.id = dmm.module_id 
                  AND dmm.day = '${currentDay}'
      GROUP BY 
        s.id, s.name
      ORDER BY 
        s.id 
      LIMIT 100`);
    if (!results.length) {
      alert("Query OK (no result)");
      return;
    }

    console.log(results);
    results.forEach((result) => {
      result.values.forEach((row) => {
        const tr = document.createElement("tr");
        let td = null;

        td = document.createElement("td");
        td.textContent = row[0];
        td.className = "d-none"; // Hide the ID column
        tr.appendChild(td);

        td = document.createElement("td");
        td.textContent = row[1];
        td.className = "px-0 text-center"
        tr.appendChild(td);

        td = document.createElement("td");
        td.textContent = row[2];
        tr.appendChild(td);

        td = document.createElement("td");
        td.textContent = row[3];
        tr.appendChild(td);

        td = document.createElement("td");
        td.textContent = row[4];
        tr.appendChild(td);

        td = document.createElement("td");
        td.textContent = row[5];
        tr.appendChild(td);

        td = document.createElement("td");
        td.textContent = row[6];
        tr.appendChild(td);

        td = document.createElement("td");
        td.textContent = row[7];
        tr.appendChild(td);

        td = document.createElement("td");
        const editBtn = document.createElement("button");
        editBtn.className = "btn btn-sm btn-primary";
        editBtn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>';
        editBtn.onclick = function () {
          $("#newStudentDayModal").modal("show");
          $("#studentName").val(row[1]);
          $("#memorization").val(row[2] || "");
          $("#attendance").val(row[3] || "");
          $("#dressCode").val(row[4] || "");
          $("#haircut").val(row[5] || "");
          $("#behavior").val(row[6] || "");
          $("#prayer").val(row[7] || "");
          $("#studentDayForm").on("submit", function (e) {
            e.preventDefault();
            if (!db) {
              alert("لا يوجد قاعدة بيانات مفتوحة.");
              return;
            }
            update_day_module_moyenne((studentId = row[0]));
            $("#newStudentDayModal").modal("hide");
          });
        };
        td.appendChild(editBtn);
        tr.appendChild(td);

        $("#dayListTable tbody").append(tr);
      });
    });
  } catch (e) {
    alert("Error: " + e.message);
  }
}

function loadStudentsList() {
  $("#studentsListTable tbody").empty();
  if (!db) {
    $("#studentsListTable tbody").append(
      "<tr><td colspan='3'>لا توجد معلومات.</td></tr>"
    );
    return;
  }
  try {
    const results = db.exec("SELECT * FROM students;");
    if (!results.length) {
      alert("Query OK (no result)");
      return;
    }

    results.forEach((result) => {
      result.values.forEach((row) => {
        const tr = document.createElement("tr");
        row.forEach((cell) => {
          const td = document.createElement("td");
          td.textContent = cell;
          tr.appendChild(td);
        });
        const actionsTd = document.createElement("td");
        actionsTd.className = "text-center";

        const dropdownDiv = document.createElement("div");
        dropdownDiv.className = "dropdown";

        const dropdownBtn = document.createElement("button");
        dropdownBtn.className = "btn btn-sm btn-primary dropdown-toggle";
        dropdownBtn.type = "button";
        dropdownBtn.setAttribute("data-toggle", "dropdown");
        dropdownBtn.setAttribute("aria-expanded", "false");

        const dropdownMenu = document.createElement("div");
        dropdownMenu.className = "dropdown-menu";

        // Detail
        const detailBtn = document.createElement("button");
        detailBtn.className = "dropdown-item btn-info";
        detailBtn.type = "button";
        detailBtn.innerHTML = '<i class="fa-regular fa-address-card"></i> تفاصيل';
        dropdownMenu.appendChild(detailBtn);

        // Edit
        const editBtn = document.createElement("button");
        editBtn.className = "dropdown-item btn-secondary";
        editBtn.type = "button";
        editBtn.innerHTML = '<i class="fa-solid fa-user-pen"></i> تعديل';
        dropdownMenu.appendChild(editBtn);

        // Delete
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "dropdown-item btn-danger";
        deleteBtn.type = "button";
        deleteBtn.innerHTML = '<i class="fa-solid fa-user-slash"></i> حذف';
        dropdownMenu.appendChild(deleteBtn);

        dropdownDiv.appendChild(dropdownBtn);
        dropdownDiv.appendChild(dropdownMenu);
        actionsTd.appendChild(dropdownDiv);
        tr.appendChild(actionsTd);
        $("#studentsListTable tbody").append(tr);
      });
    });
  } catch (e) {
    alert("Error: " + e.message);
  }
}

async function init() {
  SQL = await initSqlJs({
    locateFile: (file) =>
      `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.13.0/${file}`,
  });

  loadFromIndexedDB((savedData) => {
    if (savedData) {
      db = new SQL.Database(new Uint8Array(savedData));
    } else {
      alert("no previous database in indexedDB!");
    }
  });
}

function openDatabase(callback) {
  const request = indexedDB.open(DB_KEY, 1);

  request.onupgradeneeded = function (event) {
    const db = event.target.result;
    if (!db.objectStoreNames.contains(DB_STORE_NAME)) {
      db.createObjectStore(DB_STORE_NAME);
    }
  };

  request.onsuccess = function () {
    const db = request.result;
    callback(db);
  };

  request.onerror = function (e) {
    console.error("IndexedDB open error:", e.target.error);
  };
}

function saveToIndexedDB(data) {
  openDatabase((idb) => {
    const tx = idb.transaction(DB_STORE_NAME, "readwrite");
    const store = tx.objectStore(DB_STORE_NAME);
    store.put(data, DB_KEY);
    tx.oncomplete = () => idb.close();
  });
}

function loadFromIndexedDB(callback) {
  openDatabase((idb) => {
    const tx = idb.transaction(DB_STORE_NAME, "readonly");
    const store = tx.objectStore(DB_STORE_NAME);
    const getRequest = store.get(DB_KEY);
    getRequest.onsuccess = () => {
      callback(getRequest.result || null);
      idb.close();
    };
    getRequest.onerror = () => {
      console.error("Error reading from IndexedDB");
      callback(null);
      idb.close();
    };
  });
}

function loadDBFromFile(file) {
  const reader = new FileReader();
  reader.onload = function () {
    const uInt8Array = new Uint8Array(reader.result);
    db = new SQL.Database(uInt8Array);
    saveToIndexedDB(db.export());
    loadStudentsList();
    alert("Database loaded.");
  };
  reader.readAsArrayBuffer(file);
}

function downloadDB() {
  const data = db.export();
  const blob = new Blob([data], { type: "application/octet-stream" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "mydb.sqlite";
  a.click();
}

$("#downloadBtn").on("click", downloadDB);
$("#fileInput").on("change", (e) => {
  if (e.target.files.length) {
    loadDBFromFile(e.target.files[0]);
  }
});

$("#addStudentBtn").on("click", () => {
  const name = nameInput.val();
  const age = ageInput.val();
  const parentPhone = parentPhoneInput.val();
  if (!name || !age || !parentPhone) {
    alert("الرجاء ملء جميع الحقول.");
    return;
  }
  if (!/^(05|06|07)\d{8}$/.test(parentPhoneInput.val())) {
    alert(
      "رقم الهاتف غير صالح. يجب أن يبدأ بـ 05 أو 06 أو 07 ويتكون من 10 أرقام."
    );
    return;
  }
  if (!db) {
    alert("لا يوجد قاعدة بيانات مفتوحة.");
    return;
  }
  try {
    db.run("INSERT INTO students (name, age, parent_phone) VALUES (?, ?, ?);", [
      name,
      age,
      parentPhone,
    ]);
    saveToIndexedDB(db.export());
    loadStudentsList();
    resetNewStudentsFields();
    alert("تم إضافة الطالب بنجاح.");
  } catch (e) {
    alert("Error: " + e.message);
  }
});
// show student details
$("#studentsListTable").on("click", "button.btn-info", function () {
  const row = $(this).closest("tr");
  const cells = row.find("td");
  const studentDetails = {
    id: cells.eq(0).text(),
    name: cells.eq(1).text(),
    age: cells.eq(2).text(),
    parentPhone: cells.eq(3).text(),
  };
  alert(
    `تفاصيل الطالب:\nالمعرف: ${studentDetails.id}\nالاسم: ${studentDetails.name}\nالعمر: ${studentDetails.age}\nهاتف الولي: ${studentDetails.parentPhone}`
  );
});
// edit student
$("#studentsListTable").on("click", "button.btn-secondary", function () {
  const row = $(this).closest("tr");
  const cells = row.find("td");
  const studentId = cells.eq(0).text();
  const name = cells.eq(1).text();
  const age = cells.eq(2).text();
  const parentPhone = cells.eq(3).text();
  nameInput.val(name);
  ageInput.val(age);
  parentPhoneInput.val(parentPhone);

  $("#addStudentBtn").before(updateStudentBtn);
  updateStudentBtn.on("click", () => {
    if (!db) {
      alert("لا يوجد قاعدة بيانات مفتوحة.");
      return;
    }
    if (!nameInput.val() || !ageInput.val() || !parentPhoneInput.val()) {
      alert("الرجاء ملء جميع الحقول.");
      return;
    }
    if (!/^(05|06|07)\d{8}$/.test(parentPhoneInput.val())) {
      alert(
        "رقم الهاتف غير صالح. يجب أن يبدأ بـ 05 أو 06 أو 07 ويتكون من 10 أرقام."
      );
      return;
    }
    try {
      db.run(
        "UPDATE students SET name = ?, age = ?, parent_phone = ? WHERE id = ?;",
        [nameInput.val(), ageInput.val(), parentPhoneInput.val(), studentId]
      );
      saveToIndexedDB(db.export());
      loadStudentsList();
      resetNewStudentsFields();
      alert("تم تعديل الطالب بنجاح.");
    } catch (e) {
      alert("Error: " + e.message);
    }
  });
});
// delete student
$("#studentsListTable").on("click", "button.btn-danger", function () {
  const row = $(this).closest("tr");
  const cells = row.find("td");
  const studentId = cells.eq(0).text();
  if (!confirm("هل أنت متأكد أنك تريد حذف هذا الطالب؟")) {
    return;
  }
  if (!db) {
    alert("لا يوجد قاعدة بيانات مفتوحة.");
    return;
  }
  try {
    db.run("DELETE FROM students WHERE id = ?;", [studentId]);
    saveToIndexedDB(db.export());
    loadStudentsList();
    alert("تم حذف الطالب بنجاح.");
  } catch (e) {
    alert("Error: " + e.message);
  }
});
// reset form fields
function showTab(tabId) {
  $(".tab-pane").removeClass("show active");
  $("#" + tabId).tab("show");
  if (tabId === "pills-students") {
    loadStudentsList();
    resetNewStudentsFields();
  } else if (tabId === "pills-new_day") {
    loadDayStudentsList();
    $("#newStudentDayModal").modal("hide");
  }
}
// Initialize the application
init();

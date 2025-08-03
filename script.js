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
const newStudentDayModal = $("#newStudentDayModal");
const studentDayForm = $("#studentDayForm");
const studentIdInput = $("#studentId");
const nameInput = $("#name");
const birthdayInput = $("#birthday");
const parentPhoneInput = $("#parentPhone");
const newStudentInfosModal = $("#newStudentInfosModal");
const newStudentInfosForm = $("#newStudentInfosForm");

// students tab
function loadStudentsList() {
  $("#studentsListTable").bootstrapTable("destroy");
  try {
    const results = db.exec("SELECT * FROM students;");
    if (!results.length) {
      alert("Query OK (no result)");
      return;
    }

    results.forEach((result) => {
      const data = [];
      result.values.forEach((row) => {
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
        detailBtn.innerHTML =
          '<i class="fa-regular fa-address-card"></i> تفاصيل';
        detailBtn.onclick = function () {
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
        };
        dropdownMenu.appendChild(detailBtn);

        // Edit
        const editBtn = document.createElement("button");
        editBtn.className = "dropdown-item btn-secondary";
        editBtn.type = "button";
        editBtn.innerHTML = '<i class="fa-solid fa-user-pen"></i> تعديل';
        editBtn.onclick = function () {
          newStudentInfosModal.modal("show");
          const row = $(this).closest("tr");
          const cells = row.find("td");
          const studentId = cells.eq(0).text();
          const name = cells.eq(1).text();
          const birthday = cells.eq(2).text();
          const parentPhone = cells.eq(3).text();
          studentIdInput.val(studentId);
          nameInput.val(name);
          birthdayInput.val(birthday);
          parentPhoneInput.val(parentPhone);
        };
        dropdownMenu.appendChild(editBtn);

        // Delete
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "dropdown-item btn-danger";
        deleteBtn.type = "button";
        deleteBtn.innerHTML = '<i class="fa-solid fa-user-slash"></i> حذف';
        deleteBtn.onclick = function () {
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
        };
        dropdownMenu.appendChild(deleteBtn);

        dropdownDiv.appendChild(dropdownBtn);
        dropdownDiv.appendChild(dropdownMenu);
        data.push({
          id: row[0],
          name: row[1],
          age: new Date().getFullYear() - new Date(row[2]).getFullYear(),
          parentPhone: row[3],
          actions: dropdownDiv,
        });
      });
      $("#studentsListTable").bootstrapTable({ data });
    });
  } catch (e) {
    alert("Error: " + e.message);
  }
}

// day students list tab
newStudentInfosForm.on("submit", (e) => {
  e.preventDefault();
  if (!db) {
    alert("لا يوجد قاعدة بيانات مفتوحة.");
    return;
  }
  const name = nameInput.val();
  const birthday = birthdayInput.val();
  const parentPhone = parentPhoneInput.val();

  if (!name || !birthday || !parentPhone) {
    alert("الرجاء ملء جميع الحقول.");
    return;
  }
  if (!/^(05|06|07)\d{8}$/.test(parentPhone)) {
    alert(
      "رقم الهاتف غير صالح. يجب أن يبدأ بـ 05 أو 06 أو 07 ويتكون من 10 أرقام."
    );
    return;
  }
  try {
    if (studentIdInput.val()) {
      db.run(
        "UPDATE students SET name = ?, age = ?, parent_phone = ? WHERE id = ?;",
        [name, birthday, parentPhone, studentIdInput.val()]
      );
      alert("تم تعديل الطالب بنجاح.");
    } else {
      db.run(
        "INSERT INTO students (name, birthday, parent_phone) VALUES (?, ?, ?);",
        [name, birthday, parentPhone]
      );
      newStudentInfosForm[0].reset();
      alert("تم إضافة الطالب بنجاح.");
    }
    saveToIndexedDB(db.export());
    newStudentInfosModal.modal("hide");
    loadStudentsList();
  } catch (e) {
    alert("Error: " + e.message);
  }
});

newStudentInfosModal.on("show.bs.modal", function () {
  newStudentInfosForm[0].reset();
});

newStudentInfosModal.on("shown.bs.modal", function () {
  if (studentIdInput.val()) {
    $("#newStudentInfosModal [type='submit']").text("تحديث");
  } else {
    $("#newStudentInfosModal [type='submit']").text("إظافة");
  }
});

newStudentDayModal.on("show.bs.modal", function () {
  $("#studentName").attr("disabled", false);
  $("#requirBook").attr("disabled", false);
  $("#requirType").attr("disabled", false);
  $("#requirQuantity").attr("disabled", false);
  $("#requirEvaluation").attr("disabled", false);
  $("#requirement").attr("disabled", false);
  $("#dressCode").attr("disabled", false);
  $("#haircut").attr("disabled", false);
  $("#behavior").attr("disabled", false);
  $("#prayer").attr("disabled", false);
  studentDayForm[0].reset();
});

$("#attendance").on("change", function () {
  if ($(this).val() === "1") {
    $("#studentName").attr("disabled", true);
    $("#requirBook").attr("disabled", true);
    $("#requirType").attr("disabled", true);
    $("#requirQuantity").attr("disabled", true);
    $("#requirEvaluation").attr("disabled", true);
    $("#requirement").attr("disabled", true);
    $("#dressCode").attr("disabled", true);
    $("#haircut").attr("disabled", true);
    $("#behavior").attr("disabled", true);
    $("#prayer").attr("disabled", true);
  } else {
    $("#studentName").attr("disabled", false);
    $("#requirBook").attr("disabled", false);
    $("#requirType").attr("disabled", false);
    $("#requirQuantity").attr("disabled", false);
    $("#requirEvaluation").attr("disabled", false);
    $("#requirement").attr("disabled", false);
    $("#dressCode").attr("disabled", false);
    $("#haircut").attr("disabled", false);
    $("#behavior").attr("disabled", false);
    $("#prayer").attr("disabled", false);
  }
});

$("#requirQuantity, #requirEvaluation, #requirType").on(
  "change input",
  function () {
    const quantity = parseFloat($("#requirQuantity").val());
    const evaluation = parseFloat($("#requirEvaluation").val());
    const type = $("#requirType").val();

    if (!quantity || !evaluation || !type) {
      $("#requirement").val("");
      return;
    }

    let value = 0;
    if (type === "حفظ") {
      value = evaluation * quantity;
    } else if (type === "مراجعة") {
      value = evaluation * (quantity / 3);
    }
    $("#requirement").val(value ? value.toFixed(2) : "");
  }
);

function update_day_module_evaluation(studentId) {
  if (!db) {
    alert("لا يوجد قاعدة بيانات مفتوحة.");
    return;
  }
  try {
    if ($("#attendance").val() !== "1") {
      db.run(
        "INSERT OR REPLACE INTO day_requirements (student_id, day, book, type,quantity, evaluation) VALUES (?, ?, ?, ?,?,?);",
        [
          studentId,
          currentDay,
          $("#requirBook").val(),
          $("#requirType").val(),
          $("#requirQuantity").val(),
          $("#requirEvaluation").val(),
        ]
      );

      const modules = [
        { id: 1, selector: "#requirement" },
        { id: 2, selector: "#attendance" },
        { id: 3, selector: "#dressCode" },
        { id: 4, selector: "#haircut" },
        { id: 5, selector: "#behavior" },
        { id: 6, selector: "#prayer" },
      ];
      modules.forEach((mod) => {
        db.run(
          "INSERT OR REPLACE INTO day_module_evaluation (student_id, module_id, day, evaluation) VALUES (?, ?, ?, ?);",
          [studentId, mod.id, currentDay, $(mod.selector).val()]
        );
      });
    } else {
      db.run(
        "INSERT OR REPLACE INTO day_module_evaluation (student_id, module_id, day, evaluation) VALUES (?, ?, ?, ?);",
        [studentId, 2, currentDay, $("#attendance").val()]
      );
    }
    saveToIndexedDB(db.export());
    loadDayStudentsList();
  } catch (e) {
    alert("Error: " + e.message);
  }
}

function loadDayStudentsList() {
  $("#dayListTable").bootstrapTable("destroy");
  if (!db) {
    $("#dayListTable tbody").append(
      "<tr><td colspan='3'>لا توجد معلومات.</td></tr>"
    );
    return;
  }
  try {
    const results = db.exec(`
      SELECT 
        s.id AS student_id, s.name AS student_name,
        MAX(dr.book) AS "الكتاب",
        MAX(dr.type) AS "النوع",
        MAX(dr.quantity) AS "المقدار",
        MAX(dr.evaluation) AS "التقدير",
        MAX(CASE WHEN m.id = 1 THEN dmm.evaluation ELSE NULL END) AS "الحفظ",
        MAX(CASE WHEN m.id = 2 THEN dmm.evaluation ELSE NULL END) AS "الحظور",
        MAX(CASE WHEN m.id = 3 THEN dmm.evaluation ELSE NULL END) AS "الهندام",
        MAX(CASE WHEN m.id = 4 THEN dmm.evaluation ELSE NULL END) AS "الحلاقة",
        MAX(CASE WHEN m.id = 5 THEN dmm.evaluation ELSE NULL END) AS "السلوك",
        MAX(CASE WHEN m.id = 6 THEN dmm.evaluation ELSE NULL END) AS "الصلاة"
      FROM 
        students s
      CROSS JOIN 
        modules m
      LEFT JOIN 
        day_module_evaluation dmm ON s.id = dmm.student_id 
        AND m.id = dmm.module_id 
        AND dmm.day = '${currentDay}'
      LEFT JOIN 
        day_requirements dr ON s.id = dr.student_id 
        AND dr.day = '${currentDay}'
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
      const data = [];
      result.values.forEach((row) => {
        // const tr = document.createElement("tr");
        // let td = null;

        // td = document.createElement("td");
        // td.textContent = row[0];
        // td.className = "d-none"; // Hide the ID column
        // tr.appendChild(td);
        // // student name
        // td = document.createElement("td");
        // td.textContent = row[1];
        // td.className = "px-0 text-center";
        // tr.appendChild(td);
        // // attendance
        // td = document.createElement("td");
        // td.textContent = $('#attendance option[value="' + row[7] + '"]').text();
        // tr.appendChild(td);
        // // book
        // td = document.createElement("td");
        // td.textContent = row[7] === 1 ? "/":row[2];
        // tr.appendChild(td);
        // // type
        // td = document.createElement("td");
        // td.textContent = row[7] === 1 ? "/":row[3];
        // tr.appendChild(td);
        // // quantity
        // td = document.createElement("td");
        // td.textContent = row[7] === 1 ? "/":row[4];
        // tr.appendChild(td);
        // // evaluation
        // td = document.createElement("td");
        // td.textContent = row[7] === 1 ? "/":row[5];
        // tr.appendChild(td);
        // requirement
        // td = document.createElement("td");
        // td.textContent = row[7] === 1 ? "/":row[6];
        // tr.appendChild(td);
        // // dressCode
        // td = document.createElement("td");
        // td.textContent = row[7] === 1 ? "/":$('#dressCode option[value="' + row[8] + '"]').text();
        // tr.appendChild(td);
        // // haircut
        // td = document.createElement("td");
        // td.textContent = row[7] === 1 ? "/":$('#haircut option[value="' + row[9] + '"]').text();
        // tr.appendChild(td);
        // // behavior
        // td = document.createElement("td");
        // td.textContent = row[7] === 1 ? "/":$('#behavior option[value="' + row[10] + '"]').text();
        // tr.appendChild(td);
        // // prayer
        // td = document.createElement("td");
        // td.textContent = row[7] === 1 ? "/":$('#prayer option[value="' + row[11] + '"]').text();
        // tr.appendChild(td);

        td = document.createElement("td");
        const editBtn = document.createElement("button");
        editBtn.className = "btn btn-sm btn-primary";
        editBtn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>';
        editBtn.onclick = function () {
          newStudentDayModal.modal("show");
          $("#studentName").val(row[1]);
          $("#requirBook")
            .val(row[2] || "")
            .change();
          $("#requirType")
            .val(row[3] || "")
            .change();
          $("#requirQuantity")
            .val(row[4] || "")
            .change();
          $("#requirEvaluation")
            .val(row[5] || "")
            .change();
          $("#requirement").val(row[6] || "");
          $("#attendance")
            .val(row[7] || "")
            .change();
          $("#dressCode").val(row[8] || "");
          $("#haircut").val(row[9] || "");
          $("#behavior").val(row[10] || "");
          $("#prayer").val(row[11] || "");
          studentDayForm.off("submit"); // Remove previous submit handler
          studentDayForm.on("submit", function (e) {
            e.preventDefault();
            if (!db) {
              alert("لا يوجد قاعدة بيانات مفتوحة.");
              return;
            }
            update_day_module_evaluation(row[0]);
            newStudentDayModal.modal("hide");
          });
        };
        data.push({
          id: row[0],
          student: row[1],
          attendance: $('#attendance option[value="' + row[7] + '"]').text(),
          book: row[7] === 1 ? "/":row[2],
          type: row[7] === 1 ? "/":row[3],
          quantity: row[7] === 1 ? "/":row[4],
          evaluation: row[7] === 1 ? "/":row[5],
          requirement: row[7] === 1 ? "/":row[6],
          dressCode: row[7] === 1 ? "/":$('#dressCode option[value="' + row[8] + '"]').text(),
          haircut: row[7] === 1 ? "/":$('#haircut option[value="' + row[9] + '"]').text(),
          behavior: row[7] === 1 ? "/":$('#behavior option[value="' + row[10] + '"]').text(),
          prayer: row[7] === 1 ? "/":$('#prayer option[value="' + row[11] + '"]').text(),
          actions: editBtn,
        });

        // $("#dayListTable tbody").append(tr);
      });
      $("#dayListTable").bootstrapTable({ data });
    });
  } catch (e) {
    alert("Error: " + e.message);
  }
}

// global functions
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

function showTab(tabId) {
  $(".tab-pane").removeClass("show active");
  $("#" + tabId).tab("show");
  if (tabId === "pills-students") {
    loadStudentsList();
    newStudentInfosForm[0].reset();
  } else if (tabId === "pills-new_day") {
    loadDayStudentsList();
    newStudentDayModal.modal("hide");
  }
}
// Initialize the application
init();

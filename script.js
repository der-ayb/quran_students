// script.js
let project_db, SQL, currentDay;
const DB_STORE_NAME = "sqlite-db2";
const DB_KEY = "mydb";
const dayDateInput = $("#dayDate");
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
    const results = project_db.exec("SELECT * FROM students;");
    if (!results.length) {
      showToast("info", "Query OK (no result)");
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
          const result = project_db.exec(
            "SELECT * FROM students WHERE id = ?;",
            [studentId]
          );
          studentIdInput.val(studentId);
          nameInput.val(result[0].values[0][1]);
          birthdayInput.val(result[0].values[0][2]);
          parentPhoneInput.val(result[0].values[0][3]);
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
          if (!project_db) {
            showToast("info", "لا يوجد قاعدة بيانات مفتوحة.");
            return;
          }
          try {
            project_db.run("DELETE FROM students WHERE id = ?;", [studentId]);
            saveToIndexedDB(project_db.export());
            loadStudentsList();
            showToast("success", "تم حذف الطالب بنجاح.");
          } catch (e) {
            showToast("warning", "Error: " + e.message);
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
    showToast("warning", "Error: " + e.message);
  }
}

// day students list tab
newStudentInfosForm.on("submit", (e) => {
  e.preventDefault();
  if (!project_db) {
    showToast("info", "لا يوجد قاعدة بيانات مفتوحة.");
    return;
  }
  const name = nameInput.val();
  const birthday = birthdayInput.val();
  const parentPhone = parentPhoneInput.val();

  if (!name || !birthday || !parentPhone) {
    showToast("error", "الرجاء ملء جميع الحقول.");
    return;
  }
  if (!/^(05|06|07)\d{8}$/.test(parentPhone)) {
    showToast(
      "error",
      "رقم الهاتف غير صالح. يجب أن يبدأ بـ 05 أو 06 أو 07 ويتكون من 10 أرقام."
    );
    return;
  }
  try {
    if (studentIdInput.val()) {
      project_db.run(
        "UPDATE students SET name = ?, birthday = ?, parent_phone = ? WHERE id = ?;",
        [name, birthday, parentPhone, studentIdInput.val()]
      );
      showToast("success", "تم تعديل الطالب بنجاح.");
    } else {
      project_db.run(
        "INSERT INTO students (name, birthday, parent_phone) VALUES (?, ?, ?);",
        [name, birthday, parentPhone]
      );
      newStudentInfosForm[0].reset();
      showToast("success", "تم إضافة الطالب بنجاح.");
    }
    saveToIndexedDB(project_db.export());
    newStudentInfosModal.modal("hide");
    loadStudentsList();
  } catch (e) {
    showToast("error", "Error: " + e.message);
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
  if (!project_db) {
    showToast("info", "لا يوجد قاعدة بيانات مفتوحة.");
    return;
  }
  try {
    if ($("#attendance").val() !== "1") {
      project_db.run(
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
        project_db.run(
          "INSERT OR REPLACE INTO day_module_evaluation (student_id, module_id, day, evaluation) VALUES (?, ?, ?, ?);",
          [studentId, mod.id, currentDay, $(mod.selector).val()]
        );
      });
    } else {
      project_db.run(
        "INSERT OR REPLACE INTO day_module_evaluation (student_id, module_id, day, evaluation) VALUES (?, ?, ?, ?);",
        [studentId, 2, currentDay, $("#attendance").val()]
      );
    }
    saveToIndexedDB(project_db.export());
    loadDayStudentsList();
  } catch (e) {
    showToast("error", "Error: " + e.message);
  }
}

function loadDayStudentsList() {
  $("#dayListTable").bootstrapTable("destroy");
  if (!project_db) {
    $("#dayListTable tbody").append(
      "<tr><td colspan='3'>لا توجد معلومات.</td></tr>"
    );
    return;
  }
  try {
    const results = project_db.exec(`
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
      showToast("info", "Query OK (no result)");
      return;
    }

    console.log(results);
    results.forEach((result) => {
      const data = [];
      result.values.forEach((row) => {
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
            if (!project_db) {
              showToast("info", "لا يوجد قاعدة بيانات مفتوحة.");
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
          book: row[7] === 1 ? "/" : row[2] || "",
          type: row[7] === 1 ? "/" : row[3] || "",
          quantity: row[7] === 1 ? "/" : row[4] || "",
          evaluation: row[7] === 1 ? "/" : row[5] || "",
          requirement: row[7] === 1 ? "/" : row[6] || "",
          dressCode:
            row[7] === 1
              ? "/"
              : $('#dressCode option[value="' + row[8] + '"]').text(),
          haircut:
            row[7] === 1
              ? "/"
              : $('#haircut option[value="' + row[9] + '"]').text(),
          behavior:
            row[7] === 1
              ? "/"
              : $('#behavior option[value="' + row[10] + '"]').text(),
          prayer:
            row[7] === 1
              ? "/"
              : $('#prayer option[value="' + row[11] + '"]').text(),
          actions: editBtn,
        });
      });
      $("#dayListTable").bootstrapTable({ data });
      // dayDateInput.prependTo('.fixed-table-toolbar');
      // dayDateInput.addClass("float-left search form-control col-4");
    });
  } catch (e) {
    showToast("error", "Error: " + e.message);
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
      project_db = new SQL.Database(new Uint8Array(savedData));
    } else {
      showToast("info", "no previous database in indexedDB!");
    }
  });

  dayDateInput.val(new Date().toISOString().slice(0, 10)).change();
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
    project_db = new SQL.Database(uInt8Array);
    saveToIndexedDB(project_db.export());
    loadStudentsList();
    showToast("success", "Database loaded.");
  };
  reader.readAsArrayBuffer(file);
}

function downloadDB() {
  const data = project_db.export();
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
dayDateInput.on("change", () => {
  if (dayDateInput.val()) {
    currentDay = dayDateInput.val();
    loadDayStudentsList();
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

function showToast(type, message) {
  let type_style;
  if (type == "error") {
    type_style = "bg-danger text-white";
  } else if (type == "warning") {
    type_style = "bg-warning text-dark";
  } else if (type == "success") {
    type_style = "bg-success text-white";
  } else if (type == "info") {
    type_style = "bg-info text-white";
  }

  const toast = $("<div>", {
    class: "toast border-0 ",
    role: "alert",
    "aria-live": "assertive",
    "aria-atomic": "true",
    "data-delay": "5000",
  }).append(
    $("<div>", {
      class: "toast-body " + type_style,
      html:
        message +
        $("<button>", {
          type: "button",
          class: "close position-absolute",
          style: "top: 5px; right: 5px;",
          "data-dismiss": "toast",
          "aria-label": "Close",
          html: $("<span>", {
            "aria-hidden": "true",
            class: "text-white",
            html: "&times;",
          }),
        }).prop("outerHTML"),
    })
  );
  toast.on("hidden.bs.toast", function () {
    $(this).remove();
  });
  $(".toast-container").append(toast);
  toast.toast("show");
}
showToast("info", "مرحباا بكم في تطبيق طلاب القرآن!");
// Initialize the application
init();

const surahs = [
  {
    number: 1,
    name: "سُورَةُ ٱلْفَاتِحَةِ",
    numberOfAyahs: 7,
  },
  {
    number: 2,
    name: "سُورَةُ البَقَرَةِ",
    numberOfAyahs: 286,
  },
  {
    number: 3,
    name: "سُورَةُ آلِ عِمۡرَانَ",
    numberOfAyahs: 200,
  },
  {
    number: 4,
    name: "سُورَةُ النِّسَاءِ",
    numberOfAyahs: 176,
  },
  {
    number: 5,
    name: "سُورَةُ المَائـِدَةِ",
    numberOfAyahs: 120,
  },
  {
    number: 6,
    name: "سُورَةُ الأَنۡعَامِ",
    numberOfAyahs: 165,
  },
  {
    number: 7,
    name: "سُورَةُ الأَعۡرَافِ",
    numberOfAyahs: 206,
  },
  {
    number: 8,
    name: "سُورَةُ الأَنفَالِ",
    numberOfAyahs: 75,
  },
  {
    number: 9,
    name: "سُورَةُ التَّوۡبَةِ",
    numberOfAyahs: 129,
  },
  {
    number: 10,
    name: "سُورَةُ يُونُسَ",
    numberOfAyahs: 109,
  },
  {
    number: 11,
    name: "سُورَةُ هُودٍ",
    numberOfAyahs: 123,
  },
  {
    number: 12,
    name: "سُورَةُ يُوسُفَ",
    numberOfAyahs: 111,
  },
  {
    number: 13,
    name: "سُورَةُ الرَّعۡدِ",
    numberOfAyahs: 43,
  },
  {
    number: 14,
    name: "سُورَةُ إِبۡرَاهِيمَ",
    numberOfAyahs: 52,
  },
  {
    number: 15,
    name: "سُورَةُ الحِجۡرِ",
    numberOfAyahs: 99,
  },
  {
    number: 16,
    name: "سُورَةُ النَّحۡلِ",
    numberOfAyahs: 128,
  },
  {
    number: 17,
    name: "سُورَةُ الإِسۡرَاءِ",
    numberOfAyahs: 111,
  },
  {
    number: 18,
    name: "سُورَةُ الكَهۡفِ",
    numberOfAyahs: 110,
  },
  {
    number: 19,
    name: "سُورَةُ مَرۡيَمَ",
    numberOfAyahs: 98,
  },
  {
    number: 20,
    name: "سُورَةُ طه",
    numberOfAyahs: 135,
  },
  {
    number: 21,
    name: "سُورَةُ الأَنبِيَاءِ",
    numberOfAyahs: 112,
  },
  {
    number: 22,
    name: "سُورَةُ الحَجِّ",
    numberOfAyahs: 78,
  },
  {
    number: 23,
    name: "سُورَةُ المُؤۡمِنُونَ",
    numberOfAyahs: 118,
  },
  {
    number: 24,
    name: "سُورَةُ النُّورِ",
    numberOfAyahs: 64,
  },
  {
    number: 25,
    name: "سُورَةُ الفُرۡقَانِ",
    numberOfAyahs: 77,
  },
  {
    number: 26,
    name: "سُورَةُ الشُّعَرَاءِ",
    numberOfAyahs: 227,
  },
  {
    number: 27,
    name: "سُورَةُ النَّمۡلِ",
    numberOfAyahs: 93,
  },
  {
    number: 28,
    name: "سُورَةُ القَصَصِ",
    numberOfAyahs: 88,
  },
  {
    number: 29,
    name: "سُورَةُ العَنكَبُوتِ",
    numberOfAyahs: 69,
  },
  {
    number: 30,
    name: "سُورَةُ الرُّومِ",
    numberOfAyahs: 60,
  },
  {
    number: 31,
    name: "سُورَةُ لُقۡمَانَ",
    numberOfAyahs: 34,
  },
  {
    number: 32,
    name: "سُورَةُ السَّجۡدَةِ",
    numberOfAyahs: 30,
  },
  {
    number: 33,
    name: "سُورَةُ الأَحۡزَابِ",
    numberOfAyahs: 73,
  },
  {
    number: 34,
    name: "سُورَةُ سَبَإٍ",
    numberOfAyahs: 54,
  },
  {
    number: 35,
    name: "سُورَةُ فَاطِرٍ",
    numberOfAyahs: 45,
  },
  {
    number: 36,
    name: "سُورَةُ يسٓ",
    numberOfAyahs: 83,
  },
  {
    number: 37,
    name: "سُورَةُ الصَّافَّاتِ",
    numberOfAyahs: 182,
  },
  {
    number: 38,
    name: "سُورَةُ صٓ",
    numberOfAyahs: 88,
  },
  {
    number: 39,
    name: "سُورَةُ الزُّمَرِ",
    numberOfAyahs: 75,
  },
  {
    number: 40,
    name: "سُورَةُ غَافِرٍ",
    numberOfAyahs: 85,
  },
  {
    number: 41,
    name: "سُورَةُ فُصِّلَتۡ",
    numberOfAyahs: 54,
  },
  {
    number: 42,
    name: "سُورَةُ الشُّورَىٰ",
    numberOfAyahs: 53,
  },
  {
    number: 43,
    name: "سُورَةُ الزُّخۡرُفِ",
    numberOfAyahs: 89,
  },
  {
    number: 44,
    name: "سُورَةُ الدُّخَانِ",
    numberOfAyahs: 59,
  },
  {
    number: 45,
    name: "سُورَةُ الجَاثِيَةِ",
    numberOfAyahs: 37,
  },
  {
    number: 46,
    name: "سُورَةُ الأَحۡقَافِ",
    numberOfAyahs: 35,
  },
  {
    number: 47,
    name: "سُورَةُ مُحَمَّدٍ",
    numberOfAyahs: 38,
  },
  {
    number: 48,
    name: "سُورَةُ الفَتۡحِ",
    numberOfAyahs: 29,
  },
  {
    number: 49,
    name: "سُورَةُ الحُجُرَاتِ",
    numberOfAyahs: 18,
  },
  {
    number: 50,
    name: "سُورَةُ قٓ",
    numberOfAyahs: 45,
  },
  {
    number: 51,
    name: "سُورَةُ الذَّارِيَاتِ",
    numberOfAyahs: 60,
  },
  {
    number: 52,
    name: "سُورَةُ الطُّورِ",
    numberOfAyahs: 49,
  },
  {
    number: 53,
    name: "سُورَةُ النَّجۡمِ",
    numberOfAyahs: 62,
  },
  {
    number: 54,
    name: "سُورَةُ القَمَرِ",
    numberOfAyahs: 55,
  },
  {
    number: 55,
    name: "سُورَةُ الرَّحۡمَٰن",
    numberOfAyahs: 78,
  },
  {
    number: 56,
    name: "سُورَةُ الوَاقِعَةِ",
    numberOfAyahs: 96,
  },
  {
    number: 57,
    name: "سُورَةُ الحَدِيدِ",
    numberOfAyahs: 29,
  },
  {
    number: 58,
    name: "سُورَةُ المُجَادلَةِ",
    numberOfAyahs: 22,
  },
  {
    number: 59,
    name: "سُورَةُ الحَشۡرِ",
    numberOfAyahs: 24,
  },
  {
    number: 60,
    name: "سُورَةُ المُمۡتَحنَةِ",
    numberOfAyahs: 13,
  },
  {
    number: 61,
    name: "سُورَةُ الصَّفِّ",
    numberOfAyahs: 14,
  },
  {
    number: 62,
    name: "سُورَةُ الجُمُعَةِ",
    numberOfAyahs: 11,
  },
  {
    number: 63,
    name: "سُورَةُ المُنَافِقُونَ",
    numberOfAyahs: 11,
  },
  {
    number: 64,
    name: "سُورَةُ التَّغَابُنِ",
    numberOfAyahs: 18,
  },
  {
    number: 65,
    name: "سُورَةُ الطَّلَاقِ",
    numberOfAyahs: 12,
  },
  {
    number: 66,
    name: "سُورَةُ التَّحۡرِيمِ",
    numberOfAyahs: 12,
  },
  {
    number: 67,
    name: "سُورَةُ المُلۡكِ",
    numberOfAyahs: 30,
  },
  {
    number: 68,
    name: "سُورَةُ القَلَمِ",
    numberOfAyahs: 52,
  },
  {
    number: 69,
    name: "سُورَةُ الحَاقَّةِ",
    numberOfAyahs: 52,
  },
  {
    number: 70,
    name: "سُورَةُ المَعَارِجِ",
    numberOfAyahs: 44,
  },
  {
    number: 71,
    name: "سُورَةُ نُوحٍ",
    numberOfAyahs: 28,
  },
  {
    number: 72,
    name: "سُورَةُ الجِنِّ",
    numberOfAyahs: 28,
  },
  {
    number: 73,
    name: "سُورَةُ المُزَّمِّلِ",
    numberOfAyahs: 20,
  },
  {
    number: 74,
    name: "سُورَةُ المُدَّثِّرِ",
    numberOfAyahs: 56,
  },
  {
    number: 75,
    name: "سُورَةُ القِيَامَةِ",
    numberOfAyahs: 40,
  },
  {
    number: 76,
    name: "سُورَةُ الإِنسَانِ",
    numberOfAyahs: 31,
  },
  {
    number: 77,
    name: "سُورَةُ المُرۡسَلَاتِ",
    numberOfAyahs: 50,
  },
  {
    number: 78,
    name: "سُورَةُ النَّبَإِ",
    numberOfAyahs: 40,
  },
  {
    number: 79,
    name: "سُورَةُ النَّازِعَاتِ",
    numberOfAyahs: 46,
  },
  {
    number: 80,
    name: "سُورَةُ عَبَسَ",
    numberOfAyahs: 42,
  },
  {
    number: 81,
    name: "سُورَةُ التَّكۡوِيرِ",
    numberOfAyahs: 29,
  },
  {
    number: 82,
    name: "سُورَةُ الانفِطَارِ",
    numberOfAyahs: 19,
  },
  {
    number: 83,
    name: "سُورَةُ المُطَفِّفِينَ",
    numberOfAyahs: 36,
  },
  {
    number: 84,
    name: "سُورَةُ الانشِقَاقِ",
    numberOfAyahs: 25,
  },
  {
    number: 85,
    name: "سُورَةُ البُرُوجِ",
    numberOfAyahs: 22,
  },
  {
    number: 86,
    name: "سُورَةُ الطَّارِقِ",
    numberOfAyahs: 17,
  },
  {
    number: 87,
    name: "سُورَةُ الأَعۡلَىٰ",
    numberOfAyahs: 19,
  },
  {
    number: 88,
    name: "سُورَةُ الغَاشِيَةِ",
    numberOfAyahs: 26,
  },
  {
    number: 89,
    name: "سُورَةُ الفَجۡرِ",
    numberOfAyahs: 30,
  },
  {
    number: 90,
    name: "سُورَةُ البَلَدِ",
    numberOfAyahs: 20,
  },
  {
    number: 91,
    name: "سُورَةُ الشَّمۡسِ",
    numberOfAyahs: 15,
  },
  {
    number: 92,
    name: "سُورَةُ اللَّيۡلِ",
    numberOfAyahs: 21,
  },
  {
    number: 93,
    name: "سُورَةُ الضُّحَىٰ",
    numberOfAyahs: 11,
  },
  {
    number: 94,
    name: "سُورَةُ الشَّرۡحِ",
    numberOfAyahs: 8,
  },
  {
    number: 95,
    name: "سُورَةُ التِّينِ",
    numberOfAyahs: 8,
  },
  {
    number: 96,
    name: "سُورَةُ العَلَقِ",
    numberOfAyahs: 19,
  },
  {
    number: 97,
    name: "سُورَةُ القَدۡرِ",
    numberOfAyahs: 5,
  },
  {
    number: 98,
    name: "سُورَةُ البَيِّنَةِ",
    numberOfAyahs: 8,
  },
  {
    number: 99,
    name: "سُورَةُ الزَّلۡزَلَةِ",
    numberOfAyahs: 8,
  },
  {
    number: 100,
    name: "سُورَةُ العَادِيَاتِ",
    numberOfAyahs: 11,
  },
  {
    number: 101,
    name: "سُورَةُ القَارِعَةِ",
    numberOfAyahs: 11,
  },
  {
    number: 102,
    name: "سُورَةُ التَّكَاثُرِ",
    numberOfAyahs: 8,
  },
  {
    number: 103,
    name: "سُورَةُ العَصۡرِ",
    numberOfAyahs: 3,
  },
  {
    number: 104,
    name: "سُورَةُ الهُمَزَةِ",
    numberOfAyahs: 9,
  },
  {
    number: 105,
    name: "سُورَةُ الفِيلِ",
    numberOfAyahs: 5,
  },
  {
    number: 106,
    name: "سُورَةُ قُرَيۡشٍ",
    numberOfAyahs: 4,
  },
  {
    number: 107,
    name: "سُورَةُ المَاعُونِ",
    numberOfAyahs: 7,
  },
  {
    number: 108,
    name: "سُورَةُ الكَوۡثَرِ",
    numberOfAyahs: 3,
  },
  {
    number: 109,
    name: "سُورَةُ الكَافِرُونَ",
    numberOfAyahs: 6,
  },
  {
    number: 110,
    name: "سُورَةُ النَّصۡرِ",
    numberOfAyahs: 3,
  },
  {
    number: 111,
    name: "سُورَةُ المَسَدِ",
    numberOfAyahs: 5,
  },
  {
    number: 112,
    name: "سُورَةُ الإِخۡلَاصِ",
    numberOfAyahs: 4,
  },
  {
    number: 113,
    name: "سُورَةُ الفَلَقِ",
    numberOfAyahs: 5,
  },
  {
    number: 114,
    name: "سُورَةُ النَّاسِ",
    numberOfAyahs: 6,
  },
];
const surahSelect = document.getElementById("surah-select");

surahs.forEach((surah) => {
  const option = document.createElement("option");
  option.value = surah.number;
  option.textContent = `${surah.number}. ${surah.name.replace("سُورَةُ","")}`;
  surahSelect.appendChild(option);
});

surahSelect.addEventListener("change", function () {
  const ayahSelect = document.getElementById("ayah-select");
  ayahSelect.innerHTML = "";
  ayahSelect.disabled = !this.value;

  if (this.value) {
    const selectedSurah = surahs.find((s) => s.number == this.value);
    for (let i = 1; i <= selectedSurah.numberOfAyahs; i++) {
      const option = document.createElement("option");
      option.value = i;
      option.textContent = i;
      ayahSelect.appendChild(option);
    }
  } else {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "-- Select surah first --";
    ayahSelect.appendChild(option);
  }
});

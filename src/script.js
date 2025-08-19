// script.js
window._toastQueue = window._toastQueue || [];
window._toastReady = false;
let project_db, quran_db, SQL;
const surahsData = [];
const DB_STORE_NAME = "my_sqlite-db";
const PROJECT_DB_KEY = "projectDB";
const QURAN_DB_KEY = "quranDB";
let students_table = null;
let students_day_table = null;
let loadingModalQueue = 0;
let userIsAuth = false;
let currentDay = new Date().toISOString().slice(0, 10);

const nav_bar = document.querySelector(".nav-bar");
const dayDateInput = document.getElementById("dayDate");
const studentIdInput = document.getElementById("studentId");
const attendanceInput = document.getElementById("attendance");
const requirEvaluationInput = document.getElementById("requirEvaluation");
const requireBookInput = document.getElementById("requirBook");
const requirQuantityInput = document.getElementById("requirQuantity");
const requirementInput = document.getElementById("requirement");
const requirTypeInput = document.getElementById("requirType");
const dressCodeInput = document.getElementById("dressCode");
const haircutInput = document.getElementById("haircut");
const behaviorInput = document.getElementById("behavior");
const prayerInput = document.getElementById("prayer");
const nameInput = document.getElementById("name");
const birthdayInput = document.getElementById("birthday");
const parentPhoneInput = document.getElementById("parentPhone");

const newStudentInfosForm = document.getElementById("newStudentInfosForm");
const studentDayForm = document.getElementById("studentDayForm");
const newStudentDayModal = new bootstrap.Modal(
  document.getElementById("newStudentDayModal")
);
const newStudentInfosModal = new bootstrap.Modal(
  document.getElementById("newStudentInfosModal")
);
const loadingModal = new bootstrap.Modal(
  document.getElementById("loadingModal")
);
const secondAyahSelect = document.getElementById("second-ayah");
const firstAyahSelect = document.getElementById("first-ayah");
const secondSurahSelect = document.getElementById("second-surah");
const firstSurahSelect = document.getElementById("first-surah");
document.addEventListener("DOMContentLoaded", function () {
  const today = new Date();
  birthdayInput.setAttribute(
    "max",
    new Date(today.setFullYear(today.getFullYear() - 3))
      .toISOString()
      .split("T")[0]
  );
  birthdayInput.setAttribute(
    "min",
    new Date(today.setFullYear(today.getFullYear() - 97))
      .toISOString()
      .split("T")[0]
  );
  dayDateInput.setAttribute("max", new Date().toISOString().slice(0, 10));
});

// students tab
function loadStudentsList() {
  if (!project_db) {
    window.showToast("info", "لا يوجد قاعدة بيانات مفتوحة.");
    return;
  }
  try {
    const results = project_db.exec("SELECT * FROM students;");

    const data = [];
    if (results.length) {
      const result = results[0];
      result.values.forEach((row) => {
        const button_group = document.createElement("div");
        button_group.className = "btn-group";
        button_group.setAttribute("role", "group");
        button_group.setAttribute("aria-label", "Basic example");

        // Edit
        const editBtn = document.createElement("button");
        editBtn.className = "btn btn-info btn-sm";
        editBtn.type = "button";
        editBtn.innerHTML = '<i class="fa-solid fa-user-pen"></i> تعديل';
        editBtn.onclick = function () {
          newStudentInfosModal.show();
          const studentId = row[0];
          const result = project_db.exec(
            "SELECT * FROM students WHERE id = ?;",
            [studentId]
          );
          studentIdInput.value = studentId;
          nameInput.value = result[0].values[0][1];
          birthdayInput.value = result[0].values[0][2];
          parentPhoneInput.value = result[0].values[0][3];
        };
        button_group.appendChild(editBtn);

        // Delete
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "btn btn-danger btn-sm";
        deleteBtn.type = "button";
        deleteBtn.innerHTML = '<i class="fa-solid fa-user-slash"></i> حذف';
        CreateOnClickUndo(deleteBtn, function () {
          const studentId = row[0];
          if (!confirm("هل أنت متأكد أنك تريد حذف هذا الطالب؟")) {
            return;
          }
          if (!project_db) {
            window.showToast("info", "لا يوجد قاعدة بيانات مفتوحة.");
            return;
          }
          try {
            project_db.run("DELETE FROM students WHERE id = ?;", [studentId]);
            saveToIndexedDB(project_db.export());
            deleteTableRow(students_table, "id", row[0]);
            window.showToast("success", "تم حذف الطالب بنجاح.");
          } catch (e) {
            window.showToast("warning", "Error: " + e.message);
          }
        });
        button_group.appendChild(deleteBtn);

        data.push({
          id: row[0],
          name: row[1],
          age: new Date().getFullYear() - new Date(row[2]).getFullYear(),
          parentPhone: "<a href='tel:" + row[3] + "'>" + row[3] + "</a>",
          actions: button_group,
        });
      });
    }
    students_table = new DataTable("#studentsListTable", {
      destroy: true,
      data: data,
      columnDefs: [
        { visible: false, targets: [4] },
        {
          targets: 4,
          orderable: false,
        },
      ],
      searching: false,
      scrollX: true,
      info: false,
      oLanguage: {
        sSearch: "بحث",
        emptyTable: "لا توجد بيانات في الجدول.",
      },
      paging: false,
      responsive: true,
      columns: [
        { data: "id" },
        { data: "name" },
        { data: "age" },
        { data: "parentPhone" },
        { data: "actions" },
      ],
      layout: {
        topStart: {
          buttons: [
            {
              text: "إظهار التفاصيل",
              action: function () {
                const columns = students_table.columns([4]);
                const isVisible = students_table
                  .column(columns[0][0])
                  .visible();

                columns.visible(!isVisible);
                students_table
                  .button(0)
                  .text(isVisible ? "إظهار التفاصيل" : "إخفاء التفاصيل");
              },
            },
            {
              text: "إضافة ✚",
              className: "btn btn-primary",
              attr: {
                "data-bs-toggle": "modal",
                "data-bs-target": "#newStudentInfosModal",
              },
            },
          ],
        },
      },
    });
  } catch (e) {
    window.showToast("warning", "Error: " + e.message);
  }
}

// day students list tab
newStudentInfosForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!project_db) {
    window.showToast("info", "لا يوجد قاعدة بيانات مفتوحة.");
    return;
  }
  const name = nameInput.value;
  const birthday = birthdayInput.value;
  const parentPhone = parentPhoneInput.value;

  if (!name || !birthday || !parentPhone) {
    window.showToast("error", "الرجاء ملء جميع الحقول.");
    return;
  }
  if (!/^(05|06|07)\d{8}$/.test(parentPhone)) {
    window.showToast(
      "error",
      "رقم الهاتف غير صالح. يجب أن يبدأ بـ 05 أو 06 أو 07 ويتكون من 10 أرقام."
    );
    return;
  }
  try {
    if (studentIdInput.value) {
      project_db.run(
        "UPDATE students SET name = ?, birthday = ?, parent_phone = ? WHERE id = ?;",
        [name, birthday, parentPhone, studentIdInput.value]
      );
      window.showToast("success", "تم تعديل الطالب بنجاح.");
    } else {
      project_db.run(
        "INSERT INTO students (name, birthday, parent_phone) VALUES (?, ?, ?);",
        [name, birthday, parentPhone]
      );
      newStudentInfosForm.reset();
      window.showToast("success", "تم إضافة الطالب بنجاح.");
    }
    saveToIndexedDB(project_db.export());
    newStudentInfosModal.hide();
    loadStudentsList();
  } catch (e) {
    window.showToast("error", "Error: " + e.message);
  }
});

document
  .getElementById("newStudentInfosModal")
  .addEventListener("show.bs.modal", function () {
    newStudentInfosForm.reset();
  });

document
  .getElementById("newStudentInfosModal")
  .addEventListener("shown.bs.modal", function () {
    const submitButton = document.querySelector(
      "#newStudentInfosModal [type='submit']"
    );
    if (studentIdInput.value) {
      submitButton.textContent = "تحديث";
    } else {
      submitButton.textContent = "إظافة";
    }
  });

document
  .getElementById("newStudentDayModal")
  .addEventListener("show.bs.modal", function () {
    document.getElementById("studentName").disabled = false;
    requireBookInput.disabled = false;
    requirTypeInput.disabled = false;
    requirQuantityInput.disabled = false;
    requirEvaluationInput.disabled = false;
    // requirementInput.readOnly = false;
    dressCodeInput.disabled = false;
    haircutInput.disabled = false;
    behaviorInput.disabled = false;
    prayerInput.disabled = false;
    studentDayForm.reset();
  });

requireBookInput.onchange = function () {
  const quranSelectionSection1 = document.getElementById(
    "quranSelectionSection1"
  );
  const quranSelectionSection2 = document.getElementById(
    "quranSelectionSection2"
  );

  if (this.value === "القرآن") {
    quranSelectionSection1.style.display = "block";
    quranSelectionSection2.style.display = "block";
    requirQuantityInput.readOnly = true;
  } else {
    quranSelectionSection1.style.display = "none";
    quranSelectionSection2.style.display = "none";
    requirQuantityInput.readOnly = false;
    requirQuantityInput.value = "";
  }
};

attendanceInput.onchange = function () {
  const elementsToDisable = [
    "studentName",
    "requirBook",
    "requirType",
    "requirQuantity",
    "requirEvaluation",
    "requirement",
    "dressCode",
    "haircut",
    "behavior",
    "prayer",
  ].map((id) => document.getElementById(id));
  const disable = this.value === "1";
  elementsToDisable.forEach((element) => {
    element.disabled = disable;
  });
  requireBookInput.value = "";
  requireBookInput.dispatchEvent(new Event("change"));
};

["requirQuantity", "requirEvaluation", "requirType"].forEach((id) => {
  const element = document.getElementById(id);
  element.onchange = calculateRequirement;
  element.oninput = calculateRequirement;
});

function calculateRequirement() {
  const quantity = parseFloat(requirQuantityInput.value);
  const evaluation = parseFloat(requirEvaluationInput.value);
  const type = requirTypeInput.value;

  if (!quantity || !evaluation || !type) {
    requirementInput.value = "";
    return;
  }

  let value = 0;
  if (type === "حفظ") {
    value = evaluation * quantity;
  } else if (type === "مراجعة") {
    value = evaluation * (quantity / 3);
  }
  requirementInput.value = value ? value.toFixed(2) : "";
}

function update_student_day_notes(studentId) {
  if (!project_db) {
    window.showToast("info", "لا يوجد قاعدة بيانات مفتوحة.");
    return;
  }
  if (attendanceInput.value !== "1") {
    project_db.run(
      "INSERT OR REPLACE INTO day_requirements (student_id, day_id, book, type,quantity, evaluation) VALUES (?, ?, ?, ?,?,?);",
      [
        studentId,
        currentDay,
        requireBookInput.value,
        requirTypeInput.value,
        requirQuantityInput.value,
        requirEvaluationInput.value,
      ]
    );

    const modules = [
      { id: 1, selector: requirementInput.value },
      { id: 2, selector: attendanceInput.value },
      { id: 3, selector: dressCodeInput.value },
      { id: 4, selector: haircutInput.value },
      { id: 5, selector: behaviorInput.value },
      { id: 6, selector: prayerInput.value },
    ];
    modules.forEach((mod) => {
      project_db.run(
        "INSERT OR REPLACE INTO day_module_evaluation (student_id, module_id, day_id, evaluation) VALUES (?, ?, ?, ?);",
        [studentId, mod.id, currentDay, mod.selector]
      );
    });
  } else {
    project_db.run(
      "INSERT OR REPLACE INTO day_module_evaluation (student_id, module_id, day_id, evaluation) VALUES (?, ?, ?, ?);",
      [studentId, 2, currentDay, attendanceInput.value]
    );
  }
  saveToIndexedDB(project_db.export());
  loadDayStudentsList();
}

function setAttendance(studentId) {}

function addNewDay() {
  if (!project_db) {
    indow.showToast("info", "لا يوجد قاعدة بيانات مفتوحة....");
    return;
  }
  project_db.run(
    "INSERT OR REPLACE INTO education_day (date, notes) VALUES (?, ?);",
    [currentDay, null]
  );
  saveToIndexedDB(project_db.export());
  loadDayStudentsList();
}

function loadDayStudentsList() {
  if (!project_db) {
    window.showToast("info", "لا يوجد قاعدة بيانات مفتوحة....");
    return;
  }
  if (students_day_table) {
    students_day_table.destroy();
    students_day_table = null;
  }

  if (
    !project_db.exec(`SELECT * FROM education_day WHERE date = '${currentDay}'`)
      .length
  ) {
    document.getElementById("addNewDayBtn").style.display = "block";
    document.getElementById("dayListTable").style.display = "none";
    return;
  }

  document.getElementById("dayListTable").style.display = "block";
  document.getElementById("addNewDayBtn").style.display = "none";

  try {
    const results = project_db.exec(`
      SELECT 
        s.id AS student_id, 
        s.name AS student_name,
        dr.book AS "الكتاب",
        dr.type AS "النوع",
        dr.quantity AS "المقدار",
        dr.evaluation AS "التقدير",
        dme.evaluation AS "الحفظ",
        (SELECT evaluation FROM day_module_evaluation WHERE student_id = s.id AND module_id = 2 AND day_id = '${currentDay}') AS "الحظور",
        (SELECT evaluation FROM day_module_evaluation WHERE student_id = s.id AND module_id = 3 AND day_id = '${currentDay}') AS "الهندام",
        (SELECT evaluation FROM day_module_evaluation WHERE student_id = s.id AND module_id = 4 AND day_id = '${currentDay}') AS "الحلاقة",
        (SELECT evaluation FROM day_module_evaluation WHERE student_id = s.id AND module_id = 5 AND day_id = '${currentDay}') AS "السلوك",
        (SELECT evaluation FROM day_module_evaluation WHERE student_id = s.id AND module_id = 6 AND day_id = '${currentDay}') AS "الصلاة"
      FROM 
        students s
      LEFT JOIN 
        day_requirements dr ON s.id = dr.student_id AND dr.day_id = '${currentDay}'
      LEFT JOIN 
        day_module_evaluation dme ON s.id = dme.student_id AND dme.module_id = 1 AND dme.day_id = '${currentDay}'
      GROUP BY 
        s.id, s.name
      ORDER BY 
        s.id 
      LIMIT 100`);

    const data = [];
    if (results.length) {
      const result = results[0];
      const studentNameEl = document.getElementById("studentName");

      result.values.forEach((row) => {
        const editBtn = document.createElement("button");
        editBtn.className = "btn btn-sm btn-primary";
        editBtn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>';
        editBtn.onclick = function () {
          newStudentDayModal.show();

          studentNameEl.value = row[1];

          attendanceInput.value = row[7] || "";
          attendanceInput.dispatchEvent(new Event("change"));

          requireBookInput.value = row[2] || "";
          requireBookInput.dispatchEvent(new Event("change"));

          requirTypeInput.value = row[3] || "";
          requirTypeInput.dispatchEvent(new Event("change"));

          requirEvaluationInput.value = row[5] || "";
          requirEvaluationInput.dispatchEvent(new Event("change"));

          requirementInput.value = row[6] || "";

          requirQuantityInput.value = row[4] || "";
          requirQuantityInput.dispatchEvent(new Event("change"));

          dressCodeInput.value = row[8] || "";
          haircutInput.value = row[9] || "";
          behaviorInput.value = row[10] || "";
          prayerInput.value = row[11] || "";

          studentDayForm.onsubmit = function (e) {
            e.preventDefault();
            if (!project_db) {
              window.showToast("info", "لا يوجد قاعدة بيانات مفتوحة.");
              return;
            }
            update_student_day_notes(row[0]);
            newStudentDayModal.hide();
          };
        };
        const attendanceOption = document.querySelector(
          `#attendance option[value='${row[7]}']`
        );
        const dressCodeOption = document.querySelector(
          `#dressCode option[value='${row[8]}']`
        );
        const haircutOption = document.querySelector(
          `#haircut option[value='${row[9]}']`
        );
        const behaviorOption = document.querySelector(
          `#behavior option[value='${row[10]}']`
        );
        const prayerOption = document.querySelector(
          `#prayer option[value='${row[11]}']`
        );
        const attendanceBtn = document.createElement("button");
        attendanceBtn.className = "btn btn-info";
        attendanceBtn.innerHTML = "غائب";
        CreateOnClickUndo(attendanceBtn, function () {
          attendanceInput.value = "1";
          attendanceInput.dispatchEvent(new Event("change"));
          update_student_day_notes(row[0]);
        });
        data.push({
          id: row[0],
          actions: editBtn,
          student: row[1],
          attendance: attendanceOption
            ? attendanceOption.textContent
            : attendanceBtn,
          book: row[7] === 1 ? "/" : row[2] || "",
          type: row[7] === 1 ? "/" : row[3] || "",
          quantity: row[7] === 1 ? "/" : row[4] || "",
          evaluation:
            row[7] === 1 ? "/" : row[5] === 0 ? "إعادة" : row[5] || "",
          requirement: row[7] === 1 ? "/" : row[6] || "",
          dressCode:
            row[7] === 1
              ? "/"
              : dressCodeOption
              ? dressCodeOption.textContent
              : "",
          haircut:
            row[7] === 1 ? "/" : haircutOption ? haircutOption.textContent : "",
          behavior:
            row[7] === 1
              ? "/"
              : behaviorOption
              ? behaviorOption.textContent
              : "",
          prayer:
            row[7] === 1 ? "/" : prayerOption ? prayerOption.textContent : "",
        });
      });
    } else {
      window.showToast("success", "لا يوجد تلاميذ.");
      showTab("pills-students");
      return;
    }
    students_day_table = new DataTable("#dayListTable", {
      destroy: true,
      searching: false,
      data: data,
      scrollX: true,
      info: false,
      oLanguage: {
        sSearch: "بحث",
        emptyTable: "لا توجد بيانات في الجدول.",
      },
      paging: false,
      responsive: true,
      columns: [
        { data: "id" },
        { data: "actions" },
        { data: "student" },
        { data: "attendance" },
        { data: "book", defaultContent: "/" },
        { data: "type", defaultContent: "/" },
        { data: "quantity", defaultContent: "/" },
        { data: "evaluation", defaultContent: "/" },
        { data: "requirement", defaultContent: "/" },
        { data: "dressCode", defaultContent: "/" },
        { data: "haircut", defaultContent: "/" },
        { data: "behavior", defaultContent: "/" },
        { data: "prayer", defaultContent: "/" },
      ],
      columnDefs: [
        { visible: false, targets: [...[0], ...[6, 7, 8, 9, 10, 11, 12]] },
        {
          targets: 1,
          orderable: false,
        },
      ],
      layout: {
        topStart: {
          buttons: [
            {
              text: "إظهار التفاصيل",
              action: function () {
                const columns = students_day_table.columns([
                  6, 7, 8, 9, 10, 11, 12,
                ]);
                const isVisible = students_day_table
                  .column(columns[0][0])
                  .visible();

                columns.visible(!isVisible);
                students_day_table
                  .button(0)
                  .text(isVisible ? "إظهار التفاصيل" : "إخفاء التفاصيل");
              },
            },
          ],
        },
      },
    });
  } catch (e) {
    window.showToast("error", "Error: " + e.message);
  }
}

// global functions
async function init() {
  initializeToast();
  SQL = await initSqlJs({
    locateFile: (file) =>
      `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.13.0/${file}`,
  });

  loadFromIndexedDB(async (savedProjectData, savedQuranData) => {
    if (savedProjectData) {
      project_db = new SQL.Database(new Uint8Array(savedProjectData));
      if (savedQuranData) {
        quran_db = new SQL.Database(new Uint8Array(savedQuranData));
        initializeAyatdata(quran_db);
      } else {
        await downloadQuranDB();
      }

      showTab("pills-summary");
      nav_bar.style.removeProperty("display");
    } else {
      showTab("pills-home");
    }
  });
}

async function downloadQuranDB() {
  showModalLoading();
  fetchAndReadFile(
    QURAN_DB_KEY,
    "https://der-ayb.github.io/quran_students/quran.sqlite",
    (db) => {
      quran_db = db;
      initializeAyatdata(db);
      hideModalLoading();
    }
  );
}

async function showModalLoading() {
  loadingModalQueue += 1;
  loadingModal.show();
  setTimeout(() => {
    if (loadingModalQueue == 0) {
      loadingModal.hide();
    }
  }, 1000);
}

async function hideModalLoading() {
  loadingModalQueue -= 1;
  if (loadingModalQueue == 0) {
    loadingModal.hide();
  }
}

function initializeToast() {
  window.showToast = function (type, message, delay = 4000) {
    if (!window._toastReady) {
      window._toastQueue.push({ message, type, delay });
      return;
    }
    window._realShowToast(message, type, delay);
  };

  function createToastElement(message, type) {
    const el = document.createElement("div");
    const bg =
      type === "error"
        ? "bg-danger text-white"
        : type === "success"
        ? "bg-success text-white"
        : type === "warning"
        ? "bg-warning text-dark"
        : "bg-info text-white";
    el.className = `toast ${bg} border-0`;
    el.setAttribute("role", "alert");
    el.setAttribute("aria-live", "assertive");
    el.setAttribute("aria-atomic", "true");
    el.innerHTML = `
          <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
          </div>
        `;
    return el;
  }
  window._realShowToast = function (message, type, delay = 4000) {
    if (!toastWrapper) {
      alert(message);
      return;
    }
    const el = createToastElement(message, type);
    toastWrapper.appendChild(el);

    if (window.bootstrap && typeof window.bootstrap.Toast === "function") {
      try {
        const bsToast = new bootstrap.Toast(el, { delay });
        bsToast.show();
        el.addEventListener("hidden.bs.toast", () => el.remove());
        return;
      } catch (err) {
        console.warn("bootstrap.Toast threw, falling back:", err);
      }
    }

    el.classList.add("show");
    setTimeout(() => el.classList.remove("show"), 10);
    setTimeout(() => el.remove(), delay + 250);
  };

  window._toastReady = true;
  if (Array.isArray(window._toastQueue) && window._toastQueue.length) {
    window._toastQueue.forEach((t) =>
      window._realShowToast(t.message, t.type, t.delay)
    );
    window._toastQueue.length = 0;
  }
}

async function openDatabase(callback) {
  const request = indexedDB.open(PROJECT_DB_KEY, 1);

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

async function saveToIndexedDB(data, db_key = PROJECT_DB_KEY) {
  openDatabase((idb) => {
    const tx = idb.transaction(DB_STORE_NAME, "readwrite");
    const store = tx.objectStore(DB_STORE_NAME);
    store.put(data, db_key);
    tx.oncomplete = () => idb.close();
  });
}

async function loadFromIndexedDB(callback) {
  openDatabase((idb) => {
    const tx = idb.transaction(DB_STORE_NAME, "readonly");
    const store = tx.objectStore(DB_STORE_NAME);
    const getProjectRequest = store.get(PROJECT_DB_KEY);
    const getQuranRequest = store.get(QURAN_DB_KEY);

    let projectResult, quranResult;
    let projectDone = false,
      quranDone = false;

    function maybeCallback() {
      if (projectDone && quranDone) {
        callback(projectResult, quranResult);
        idb.close();
      }
    }

    getProjectRequest.onsuccess = () => {
      projectResult = getProjectRequest.result || null;
      projectDone = true;
      maybeCallback();
    };
    getQuranRequest.onsuccess = () => {
      quranResult = getQuranRequest.result || null;
      quranDone = true;
      maybeCallback();
    };

    getProjectRequest.onerror = () => {
      console.error("Error reading from IndexedDB");
      projectResult = null;
      projectDone = true;
      maybeCallback();
    };
    getQuranRequest.onerror = () => {
      console.error("Error reading from IndexedDB");
      quranResult = null;
      quranDone = true;
      maybeCallback();
    };
  });
}

async function loadDBFromFile(file) {
  const reader = new FileReader();
  reader.onload = function () {
    const uInt8Array = new Uint8Array(reader.result);
    project_db = new SQL.Database(uInt8Array);
    saveToIndexedDB(project_db.export());
    window.showToast("success", "تم تحميل قاعدة البيانات.");
  };
  reader.readAsArrayBuffer(file);
}

async function exportDB() {
  const data = project_db.export();
  const blob = new Blob([data], { type: "application/x-sqlite3" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "quran_students.sqlite3";
  a.click();
  URL.revokeObjectURL(a.href);
}

async function fetchAndReadFile(
  db_key,
  url,
  callback = function () {
    window.showToast("success", "تم تحميل قاعدة البيانات.");
  }
) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch file");
    const blob = await response.blob();
    const uInt8Array = new Uint8Array(await blob.arrayBuffer());
    const db = new SQL.Database(uInt8Array);
    await saveToIndexedDB(db.export(), db_key);
    callback(db);
  } catch (error) {
    window.showToast("error", "Error reading file:" + error);
    hideModalLoading();
  }
}

document.getElementById("newDBbtn").onclick = async function () {
  showModalLoading();
  await fetchAndReadFile(
    PROJECT_DB_KEY,
    "https://der-ayb.github.io/quran_students/default.sqlite3",
    (db) => {
      project_db = db;
      hideModalLoading();
    }
  );
  await downloadQuranDB();
  window.showToast("success", "تم تحميل قواعد البيانات.");
  showTab("pills-summary");
  nav_bar.style.removeProperty("display");
};

document.getElementById("downloadBtn").onclick = exportDB;
document.getElementById("fileInput").onchange = (e) => {
  if (e.target.files.length) {
    loadDBFromFile(e.target.files[0]);
  }
};
dayDateInput.onchange = () => {
  if (dayDateInput.value) {
    currentDay = dayDateInput.value;
    loadDayStudentsList();
  }
};

function showTab(tabId) {
  document
    .querySelectorAll(".tab-pane")
    .forEach((el) => el.classList.remove("show", "active"));
  document.getElementById(tabId).classList.add("show", "active");

  if (tabId === "pills-students") {
    loadStudentsList();
    newStudentInfosForm.reset();
  } else if (tabId === "pills-home") {
    nav_bar.style.display = "none";
  } else if (tabId === "pills-new_day") {
    if (!dayDateInput.value) {
      dayDateInput.value = new Date().toISOString().slice(0, 10);
    }
    loadDayStudentsList();
    newStudentDayModal.hide();
  }
}

// Initialize the application
init();

const initializeAyatdata = async (db) => {
  const results = db.exec("SELECT * FROM quran_index");
  results[0].values.forEach((row) => {
    surahsData.push({
      number: row[0],
      name: row[1],
      numberOfAyahs: row[2],
    });
  });
  populateSurahDropdown(firstSurahSelect);
  populateSurahDropdown(secondSurahSelect);
};

const populateSurahDropdown = async (selectElement) => {
  selectElement.innerHTML = "";
  selectElement.appendChild(createOption("", "--  --"));
  surahsData.forEach((surah) => {
    selectElement.appendChild(
      createOption(surah.number, `${surah.name}`, {
        ayahs: surah.numberOfAyahs,
        surahNum: surah.number,
      })
    );
  });
};

const createOption = (value, text, dataset = {}) => {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = text;
  for (const key in dataset) {
    option.dataset[key] = dataset[key];
  }
  return option;
};

const checkSecondSurahAyahs = (secondSurahNumber) => {
  if (secondSurahNumber) {
    let ll = 1;
    if (
      parseInt(firstSurahSelect.value) === parseInt(secondSurahSelect.value)
    ) {
      ll = parseInt(firstAyahSelect.value) || 1;
    }

    const selectedOption =
      secondSurahSelect.options[secondSurahSelect.selectedIndex];
    let secondSurahAyahs = 0;
    secondSurahAyahs = parseInt(selectedOption.dataset.ayahs);
    secondAyahSelect.disabled = false;
    secondAyahSelect.innerHTML = "";

    for (let i = ll; i <= secondSurahAyahs; i++) {
      secondAyahSelect.appendChild(createOption(i, i));
    }
    secondAyahSelect.insertBefore(
      createOption("", "--  --"),
      secondAyahSelect.firstChild
    );
    secondAyahSelect.dispatchEvent(new Event("change"));
  } else {
    secondAyahSelect.disabled = true;
    secondAyahSelect.innerHTML = "";
    secondAyahSelect.appendChild(createOption("", "--  --"));
  }
};

firstSurahSelect.onchange = async function () {
  const firstSurahNumber = parseInt(this.value);

  if (firstSurahNumber) {
    const selectedOption = this.options[this.selectedIndex];
    let firstSurahAyahs = 0;
    firstSurahAyahs = parseInt(selectedOption.dataset.ayahs);
    firstAyahSelect.disabled = false;
    firstAyahSelect.innerHTML = "";

    for (let i = 1; i <= firstSurahAyahs; i++) {
      firstAyahSelect.appendChild(createOption(i, i));
    }
    firstAyahSelect.insertBefore(
      createOption("", "--  --"),
      firstAyahSelect.firstChild
    );

    secondSurahSelect.disabled = false;
    secondSurahSelect.value = firstSurahNumber;
    surahsData.forEach((surah) => {
      if (surah.number < firstSurahNumber) {
        secondSurahSelect.querySelector(
          'option[value="' + surah.number + '"]'
        ).style.display = "none";
      } else {
        secondSurahSelect.querySelector(
          'option[value="' + surah.number + '"]'
        ).style.display = "block";
      }
    });
    secondSurahSelect.dispatchEvent(new Event("change"));
  } else {
    firstAyahSelect.disabled = true;
    firstAyahSelect.innerHTML = "";
    firstAyahSelect.appendChild(createOption("", "--  --"));

    secondSurahSelect.disabled = true;
    secondSurahSelect.querySelector("option").style.display = "none";

    secondAyahSelect.disabled = true;
    secondAyahSelect.innerHTML = "";
    secondAyahSelect.appendChild(createOption("", "--  --"));
  }
};

secondSurahSelect.onchange = async function () {
  checkSecondSurahAyahs(parseInt(this.value));
};

firstAyahSelect.onchange = async function () {
  checkSecondSurahAyahs(parseInt(this.value));
};

secondAyahSelect.onchange = async function () {
  if (
    !firstSurahSelect.value ||
    !firstAyahSelect.value ||
    !secondSurahSelect.value ||
    !secondAyahSelect.value
  ) {
    requirQuantityInput.value = "";
    return;
  }
  const query = generatelignCount(
    getAyahDifference(
      firstSurahSelect.options[firstSurahSelect.selectedIndex].dataset.surahNum,
      firstAyahSelect.options[firstAyahSelect.selectedIndex].value,
      secondSurahSelect.options[secondSurahSelect.selectedIndex].dataset
        .surahNum,
      secondAyahSelect.options[secondAyahSelect.selectedIndex].value
    )
  );
  const results = quran_db.exec(query);
  if (!results || !results.length || !results[0].values.length) {
    requirQuantityInput.value = "";
    return;
  }
  const totalLines = results[0].values[0][0];
  requirQuantityInput.value = totalLines;
};

// // Function to get the difference in ayahs between two surahs
const getAyahDifference = (surahNum1, ayahNum1, surahNum2, ayahNum2) => {
  const surah1 = surahsData.find((s) => s.number === Number(surahNum1));
  const surah2 = surahsData.find((s) => s.number === Number(surahNum2));

  if (!surah1 || !surah2) {
    throw new Error("One or both surahs not found");
  }

  // Generate the full ayah ranges for both surahs
  let result = "";
  if (surah1 === surah2) {
    result = [
      {
        number: surah1.number,
        ayah: generateAyahRange(ayahNum1, ayahNum2),
      },
    ];
  } else {
    result = [
      {
        number: surah1.number,
        ayah: generateAyahRange(ayahNum1, surah1.numberOfAyahs),
      },
      {
        number: surah2.number,
        ayah: generateAyahRange(1, ayahNum2),
      },
    ];
  }

  // Include all surahs between them if they're not consecutive
  const start = Math.min(surah1.number, surah2.number);
  const end = Math.max(surah1.number, surah2.number);

  for (let i = start + 1; i < end; i++) {
    const betweenSurah = surahsData.find((s) => s.number === i);
    if (betweenSurah) {
      result.splice(result.length - 1, 0, {
        number: betweenSurah.number,
        ayah: generateAyahRange(1, betweenSurah.numberOfAyahs),
      });
    }
  }

  return result;
};

const generateAyahRange = (start, end) => {
  return `${start}-${end}`;
};

const generatelignCount = (ranges) => {
  const conditions = ranges
    .map((range) => {
      const [start, end] = range.ayah.split("-").map(Number);
      return `(sura = ${range.number} AND ayah BETWEEN ${start} AND ${end})`;
    })
    .join(" OR\n  ");

  return `
    SELECT 
      ROUND(SUM(lign_count), 1) AS rounded_total
    FROM quran_ayat
    WHERE ${conditions};
  `;
};

function deleteTableRow(table, columnName) {
  table.rows().every(function () {
    var rowData = this.data();
    console.log(rowData);
    if (rowData[columnName] === columnValue) {
      this.remove();
    }
  });
  table.draw();
}

function CreateOnClickUndo(button, actionFunction, removeBtn = false) {
  button.setAttribute("data-count", "");
  const buttonClassName = button.className;
  const buttonText = button.innerHTML;

  let countdownInterval;
  let actionTimeout;
  const delaySeconds = 3;

  button.onclick = function handleButtonClick(e) {
    const currentState = button.classList.contains("UndoCountdown")
      ? "UndoCountdown"
      : "initial";

    switch (currentState) {
      case "initial":
        // Clear any existing timers
        clearInterval(countdownInterval);
        clearTimeout(actionTimeout);

        // Set visual state
        button.className = buttonClassName + " UndoCountdown";
        button.style.backgroundColor = "#fbbc05";
        // button.style.paddingRight = '50px';
        button.textContent = "تراجع";
        button.dataset.count = delaySeconds;

        // Start countdown display
        let secondsRemaining = delaySeconds;
        countdownInterval = setInterval(() => {
          secondsRemaining--;
          button.dataset.count = secondsRemaining;

          if (secondsRemaining <= 0) {
            clearInterval(countdownInterval);
            // Don't execute here - the timeout will handle it
          }
        }, 1000);

        // Set action timer
        actionTimeout = setTimeout(() => {
          clearInterval(countdownInterval);
          if (removeBtn) {
            button.remove();
          } else {
            button.className = buttonClassName;
            button.style.removeProperty("background-color");
            button.innerHTML = buttonText;
            button.dataset.count = "";
          }
          actionFunction(e);
        }, delaySeconds * 1000);
        break;
      case "UndoCountdown":
        // Clear all timers
        clearInterval(countdownInterval);
        clearTimeout(actionTimeout);

        // Reset visual state
        button.className = buttonClassName;
        button.style.removeProperty("background-color");
        button.innerHTML = buttonText;
        button.dataset.count = "";
        break;
    }
  };
}

// Function to count lines in a given text
function countLines(text) {
  const ctx = document.createElement("canvas").getContext("2d");
  ctx.font = "22.4px Arial";
  ctx.direction = "rtl";
  return ctx.measureText(text).width / (10 * 37.8);
}

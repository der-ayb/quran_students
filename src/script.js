// script.js
window._toastQueue = window._toastQueue || [];
window._toastReady = false;
let project_db, quran_db, SQL, currentDay, students_table, students_day_table;
const surahsData = [];
const DB_STORE_NAME = "my_sqlite-db";
const PROJECT_DB_KEY = "projectDB";
const QURAN_DB_KEY = "quranDB";
let loadingModalQueue = 0

const dayDateInput = document.getElementById("dayDate");
const newStudentInfosForm = document.getElementById("newStudentInfosForm");
const studentDayForm = document.getElementById("studentDayForm");
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
});

// students tab
function loadStudentsList() {
  if (students_table) students_table.destroy();
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
        const dropdownDiv = document.createElement("div");
        dropdownDiv.className = "dropdown";

        const dropdownBtn = document.createElement("button");
        dropdownBtn.className = "btn btn-sm btn-primary dropdown-toggle";
        dropdownBtn.type = "button";
        dropdownBtn.setAttribute("data-bs-toggle", "dropdown");
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
          const row = this.closest("tr");
          const cells = row.querySelectorAll("td");
          const studentDetails = {
            id: cells[0].textContent,
            name: cells[1].textContent,
            age: cells[2].textContent,
            parentPhone: cells[3].textContent,
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
          newStudentInfosModal.show();
          const row = this.closest("tr");
          const cells = row.querySelectorAll("td");
          const studentId = cells[0].textContent;
          const result = project_db.exec(
            "SELECT * FROM students WHERE id = ?;",
            [studentId]
          );
          studentIdInput.value = studentId;
          nameInput.value = result[0].values[0][1];
          birthdayInput.value = result[0].values[0][2];
          parentPhoneInput.value = result[0].values[0][3];
        };
        dropdownMenu.appendChild(editBtn);

        // Delete
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "dropdown-item btn-danger";
        deleteBtn.type = "button";
        deleteBtn.innerHTML = '<i class="fa-solid fa-user-slash"></i> حذف';
        deleteBtn.onclick = function () {
          const row = this.closest("tr");
          const cells = row.querySelectorAll("td");
          const studentId = cells[0].textContent;
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
            loadStudentsList();
            window.showToast("success", "تم حذف الطالب بنجاح.");
          } catch (e) {
            window.showToast("warning", "Error: " + e.message);
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
    }
    students_table = new DataTable("#studentsListTable", {
      data: data,
      scrollX: true,
      info: false,
      oLanguage: {
        sSearch: "بحث",
        emptyTable: "لا توجد بيانات في الجدول."
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
    requirementInput.disabled = false;
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

function update_day_module_evaluation(studentId) {
  if (!project_db) {
    window.showToast("info", "لا يوجد قاعدة بيانات مفتوحة.");
    return;
  }
  if (attendanceInput.value !== "1") {
    project_db.run(
      "INSERT OR REPLACE INTO day_requirements (student_id, day, book, type,quantity, evaluation) VALUES (?, ?, ?, ?,?,?);",
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
        "INSERT OR REPLACE INTO day_module_evaluation (student_id, module_id, day, evaluation) VALUES (?, ?, ?, ?);",
        [studentId, mod.id, currentDay, mod.selector]
      );
    });
  } else {
    project_db.run(
      "INSERT OR REPLACE INTO day_module_evaluation (student_id, module_id, day, evaluation) VALUES (?, ?, ?, ?);",
      [studentId, 2, currentDay, attendanceInput.value]
    );
  }
  saveToIndexedDB(project_db.export());
  loadDayStudentsList();
}

function loadDayStudentsList() {
  if (students_day_table) students_day_table.destroy();
  if (!project_db) {
    window.showToast("info", "لا يوجد قاعدة بيانات مفتوحة....");
    return;
  }
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
        (SELECT evaluation FROM day_module_evaluation WHERE student_id = s.id AND module_id = 2 AND day = '${currentDay}') AS "الحظور",
        (SELECT evaluation FROM day_module_evaluation WHERE student_id = s.id AND module_id = 3 AND day = '${currentDay}') AS "الهندام",
        (SELECT evaluation FROM day_module_evaluation WHERE student_id = s.id AND module_id = 4 AND day = '${currentDay}') AS "الحلاقة",
        (SELECT evaluation FROM day_module_evaluation WHERE student_id = s.id AND module_id = 5 AND day = '${currentDay}') AS "السلوك",
        (SELECT evaluation FROM day_module_evaluation WHERE student_id = s.id AND module_id = 6 AND day = '${currentDay}') AS "الصلاة"
      FROM 
        students s
      LEFT JOIN 
        day_requirements dr ON s.id = dr.student_id AND dr.day = '${currentDay}'
      LEFT JOIN 
        day_module_evaluation dme ON s.id = dme.student_id AND dme.module_id = 1 AND dme.day = '${currentDay}'
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
        const td = document.createElement("td");
        const editBtn = document.createElement("button");
        editBtn.className = "btn btn-sm btn-primary";
        editBtn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>';
        editBtn.onclick = function () {
          newStudentDayModal.show();
          studentNameEl.value = row[1];
          requireBookInput.value = row[2] || "";
          requireBookInput.dispatchEvent(new Event("change"));

          requirTypeInput.value = row[3] || "";
          requirTypeInput.dispatchEvent(new Event("change"));

          requirQuantityInput.value = row[4] || "";
          requirQuantityInput.dispatchEvent(new Event("change"));

          requirEvaluationInput.value = row[5] || "";
          requirEvaluationInput.dispatchEvent(new Event("change"));

          requirementInput.value = row[6] || "";

          attendanceInput.value = row[7] || "";
          attendanceInput.dispatchEvent(new Event("change"));

          dressCodeInput.value = row[8] || "";
          haircutInput.value = row[9] || "";
          behaviorInput.value = row[10] || "";
          prayerInput.value = row[11] || "";

          studentDayForm.addEventListener("submit", function (e) {
            e.preventDefault();
            if (!project_db) {
              window.showToast("info", "لا يوجد قاعدة بيانات مفتوحة.");
              return;
            }
            update_day_module_evaluation(row[0]);
            newStudentDayModal.hide();
          });
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
        data.push({
          id: row[0],
          student: row[1],
          attendance: attendanceOption ? attendanceOption.textContent : "",
          book: row[7] === 1 ? "/" : row[2] || "",
          type: row[7] === 1 ? "/" : row[3] || "",
          quantity: row[7] === 1 ? "/" : row[4] || "",
          evaluation: row[7] === 1 ? "/" : row[5] || "",
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
          actions: editBtn,
        });
      });
    }
    students_day_table = new DataTable("#dayListTable", {
      columnDefs: [{ visible: false, targets: 0 }],
      data: data,
      scrollX: true,
      info: false,
      oLanguage: {
        sSearch: "بحث",
        emptyTable: "لا توجد بيانات في الجدول."
      },
      paging: false,
      responsive: true,
      columns: [
        { data: "id" },
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
        { data: "actions" },
      ],
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

  loadFromIndexedDB((savedProjectData, savedQuranData) => {
    const navMobile = document.querySelector(".nav-mobile");
    if (savedProjectData) {
      project_db = new SQL.Database(new Uint8Array(savedProjectData));
    } else {
      navMobile.style.display = "none";
      newDB();
    }
    if (savedQuranData) {
      quran_db = new SQL.Database(new Uint8Array(savedQuranData));
      initializeAyatdata(quran_db);
    } else {
      navMobile.style.display = "none";
      downloadQuranDB();
    }
    navMobile.style.removeProperty("display");
  });
}

function downloadQuranDB() {
  showModalLoading();
  fetchAndReadFile(
    QURAN_DB_KEY,
    "https://der-ayb.github.io/quran_students/quran.sqlite"
  ).finally(() => hideModalLoading);
}

function newDB() {
  showModalLoading();
  fetchAndReadFile(
    PROJECT_DB_KEY,
    "https://der-ayb.github.io/quran_students/default.sqlite"
  ).finally(() => hideModalLoading());
  if(quran_db){
    downloadQuranDB()
  }
}

function showModalLoading(){
  if(!loadingModal._isShown){
    loadingModal.show();
    loadingModalQueue +=1;
  }
}

function hideModalLoading(){
  if(loadingModal._isShown && loadingModalQueue == 1){
    loadingModal.hide();
    loadingModalQueue -=1;
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

async function downloadDB() {
  const data = project_db.export();
  const blob = new Blob([data], { type: "application/octet-stream" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "mydb.sqlite";
  a.click();
}

async function fetchAndReadFile(db_key, url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch file");
    const blob = await response.blob();
    const uInt8Array = new Uint8Array(await blob.arrayBuffer());
    const db = new SQL.Database(uInt8Array);
    await saveToIndexedDB(db.export(), db_key);
    if (db_key === QURAN_DB_KEY) {
      quran_db = db;
      initializeAyatdata(db);
    } else if (db_key === PROJECT_DB_KEY) {
      project_db = db;
    }
    window.showToast("success", "تم تحميل قاعدة البيانات.");
  } catch (error) {
    window.showToast("Error reading file:", error);
  }
}

document.getElementById("newDBbtn").onclick = newDB;
document.getElementById("downloadBtn").onclick = downloadDB;
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
  // const tab = new bootstrap.Tab(document.getElementById(tabId.replace('pills', 'pills-tab')));
  // tab.show();
  if (tabId === "pills-students") {
    if (!students_table) {
      loadStudentsList();
    }
    newStudentInfosForm.reset();
  } else if (tabId === "pills-new_day") {
    if (!dayDateInput.value) {
      dayDateInput.value = new Date().toISOString().slice(0, 10);
      dayDateInput.dispatchEvent(new Event("change"));
    } else if (!students_day_table) {
      loadDayStudentsList();
    }
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

// Function to count lines in a given text
function countLines(text) {
  const ctx = document.createElement("canvas").getContext("2d");
  ctx.font = "22.4px Arial";
  ctx.direction = "rtl";
  return ctx.measureText(text).width / (10 * 37.8);
}

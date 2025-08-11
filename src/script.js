// script.js
window._toastQueue = window._toastQueue || [];
window._toastReady = false;
let project_db, quran_db, SQL, currentDay;
const surahsData = [];
const DB_STORE_NAME = "my_sqlite-db";
const PROJECT_DB_KEY = "projectDB";
const QURAN_DB_KEY = "quranDB";
const dayDateInput = $("#dayDate");

const newStudentInfosForm = $("#newStudentInfosForm");
const studentDayForm = $("#studentDayForm");
const studentIdInput = $("#studentId");
const nameInput = $("#name");
const birthdayInput = $("#birthday");
const parentPhoneInput = $("#parentPhone");

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
$(function () {
  const today = new Date();
  birthdayInput.attr({
    max: new Date(today.setFullYear(today.getFullYear() - 3))
      .toISOString()
      .split("T")[0],
    min: new Date(today.setFullYear(today.getFullYear() - 97))
      .toISOString()
      .split("T")[0],
  });
});

// students tab
function loadStudentsList() {
  $("#studentsListTable").bootstrapTable("destroy");
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
          newStudentInfosModal.show();
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
    $("#studentsListTable").bootstrapTable({ data });
  } catch (e) {
    window.showToast("warning", "Error: " + e.message);
  }
}

// day students list tab
newStudentInfosForm.on("submit", (e) => {
  e.preventDefault();
  if (!project_db) {
    window.showToast("info", "لا يوجد قاعدة بيانات مفتوحة.");
    return;
  }
  const name = nameInput.val();
  const birthday = birthdayInput.val();
  const parentPhone = parentPhoneInput.val();

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
    if (studentIdInput.val()) {
      project_db.run(
        "UPDATE students SET name = ?, birthday = ?, parent_phone = ? WHERE id = ?;",
        [name, birthday, parentPhone, studentIdInput.val()]
      );
      window.showToast("success", "تم تعديل الطالب بنجاح.");
    } else {
      project_db.run(
        "INSERT INTO students (name, birthday, parent_phone) VALUES (?, ?, ?);",
        [name, birthday, parentPhone]
      );
      newStudentInfosForm[0].reset();
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
    newStudentInfosForm[0].reset();
  });

document
  .getElementById("newStudentInfosModal")
  .addEventListener("shown.bs.modal", function () {
    if (studentIdInput.val()) {
      $("#newStudentInfosModal [type='submit']").text("تحديث");
    } else {
      $("#newStudentInfosModal [type='submit']").text("إظافة");
    }
  });

document
  .getElementById("newStudentDayModal")
  .addEventListener("show.bs.modal", function () {
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

$("#requirBook").on("change", function () {
  if ($(this).val() === "القرآن") {
    $("#quranSelectionSection1").show();
    $("#quranSelectionSection2").show();
    $("#requirQuantity").attr("readonly", true);
  } else {
    $("#quranSelectionSection1").hide();
    $("#quranSelectionSection2").hide();
    $("#requirQuantity").attr("readonly", false);
    $("#requirQuantity").val("");
  }
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
    window.showToast("info", "لا يوجد قاعدة بيانات مفتوحة.");
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
    window.showToast("error", "Error: " + e.message);
  }
}

function loadDayStudentsList() {
  $("#dayListTable").bootstrapTable("destroy");
  if (!project_db) {
    window.showToast("info", "لا يوجد قاعدة بيانات مفتوحة....");
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

    const data = [];
    if (results.length) {
      const result = results[0];
      result.values.forEach((row) => {
        td = document.createElement("td");
        const editBtn = document.createElement("button");
        editBtn.className = "btn btn-sm btn-primary";
        editBtn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>';
        editBtn.onclick = function () {
          newStudentDayModal.show();
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
              window.showToast("info", "لا يوجد قاعدة بيانات مفتوحة.");
              return;
            }
            update_day_module_evaluation(row[0]);
            newStudentDayModal.hide();
          });
        };
        data.push({
          id: row[0],
          student: row[1],
          attendance: $("#attendance option[value='" + row[7] + "']").text(),
          book: row[7] === 1 ? "/" : row[2] || "",
          type: row[7] === 1 ? "/" : row[3] || "",
          quantity: row[7] === 1 ? "/" : row[4] || "",
          evaluation: row[7] === 1 ? "/" : row[5] || "",
          requirement: row[7] === 1 ? "/" : row[6] || "",
          dressCode:
            row[7] === 1
              ? "/"
              : $("#dressCode option[value='" + row[8] + "']").text(),
          haircut:
            row[7] === 1
              ? "/"
              : $("#haircut option[value='" + row[9] + "']").text(),
          behavior:
            row[7] === 1
              ? "/"
              : $("#behavior option[value='" + row[10] + "']").text(),
          prayer:
            row[7] === 1
              ? "/"
              : $("#prayer option[value='" + row[11] + "']").text(),
          actions: editBtn,
        });
      });
    }
    $("#dayListTable").bootstrapTable({ data });
    // dayDateInput.prependTo('.fixed-table-toolbar');
    // dayDateInput.addClass("float-left search form-control col-4");
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
    if (savedProjectData) {
      project_db = new SQL.Database(new Uint8Array(savedProjectData));
    } else {
      $(".nav-mobile").hide();
      const loadingModal = new bootstrap.Modal(
        document.getElementById("loadingModal")
      );
      loadingModal.show();
      fetchAndReadFile(
        PROJECT_DB_KEY,
        "https://der-ayb.github.io/quran_students/default.sqlite"
      );
      setTimeout(function () {
        loadingModal.hide();
        window.showToast("success", "Database loaded.");
      }, 2000);
    }
    if (savedQuranData) {
      quran_db = new SQL.Database(new Uint8Array(savedQuranData));
      initializeAyatdata(quran_db);
    } else {
      $(".nav-mobile").hide();
      loadingModal.show();
      fetchAndReadFile(
        QURAN_DB_KEY,
        "https://der-ayb.github.io/quran_students/quran.sqlite"
      );
      setTimeout(function () {
        loadingModal.hide();
        window.showToast("success", "Database loaded.");
      }, 2000);
    }
    $(".nav-mobile").show();
  });
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
    window.showToast("success", "Database loaded.");
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
    const reader = new FileReader();
    reader.onload = function (event) {
      const uInt8Array = new Uint8Array(reader.result);
      const db = new SQL.Database(uInt8Array);
      saveToIndexedDB(db.export(), db_key);
      if (db_key === QURAN_DB_KEY) {
        quran_db = db;
        initializeAyatdata(db);
      } else if (db_key === PROJECT_DB_KEY) {
        project_db = db;
      }
    };

    reader.readAsArrayBuffer(blob); // or reader.readAsArrayBuffer(blob) / readAsDataURL(blob)
  } catch (error) {
    window.showToast("Error reading file:", error);
  }
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
  $("#" + tabId).addClass("show active");
  // const tab = new bootstrap.Tab(document.getElementById(tabId.replace('pills', 'pills-tab')));
  // tab.show();
  if (tabId === "pills-students") {
    loadStudentsList();
    newStudentInfosForm[0].reset();
  } else if (tabId === "pills-new_day") {
    if (!dayDateInput.val()) {
      dayDateInput.val(new Date().toISOString().slice(0, 10)).change();
    } else {
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

firstSurahSelect.addEventListener("change", async function () {
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
});

secondSurahSelect.addEventListener("change", async function () {
  checkSecondSurahAyahs(parseInt(this.value));
});

firstAyahSelect.addEventListener("change", async function () {
  checkSecondSurahAyahs(parseInt(this.value));
});

secondAyahSelect.addEventListener("change", async function () {
  if (
    !firstSurahSelect.value ||
    !firstAyahSelect.value ||
    !secondSurahSelect.value ||
    !secondAyahSelect.value
  ) {
    $("#requirQuantity").val("");
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
    $("#requirQuantity").val("");
    return;
  }
  const totalLines = results[0].values[0][0];
  $("#requirQuantity").val(totalLines);
});

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

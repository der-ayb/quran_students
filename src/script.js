// --- Initialize the application (async) ---
window._toastQueue = window._toastQueue || [];
window._toastReady = false;
initializeToast();
const nav_bar = document.querySelector(".nav-bar");
if (localStorage.getItem("newUser") == true) {
  showTab("pills-splash");
} else {
  init();
}

let project_db, quran_db, SQL;
const surahsData = [];
const DB_STORE_NAME = "my_sqlite-db";
const PROJECT_DB_KEY = "quranstudentsDB";
const QURAN_DB_KEY = "quranDB";
const arabicMonths = [
  "جانفي",
  "فيفري",
  "مارس",
  "أفريل",
  "ماي",
  "جوان",
  "جويلية",
  "أوت",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];
const arabicDays = ["أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];
let workingClassroomId = localStorage.getItem("workingClassroomId");
let studentsTableDetailIsShow = false;
let studentsDayTableDetailIsShow = false;
let classroomsTableDetailIsShow = false;
let currentDay = new Date().toISOString().slice(0, 10);
let loadingModalShowNumber = [];

const workingClassroomSelect = document.getElementById("workingClassroom");
const dayDateInput = $("#dayDate");
const dayNoteContainer = document.getElementById("dayNoteContainer");
const statisticsDateInput = $("#statisticsrange");
const addQuranSelectionBtn = document.getElementById("addQuranSelectionBtn");
const attendanceInput = document.getElementById("attendance");

const requirementsTable = document.getElementById("requirementTable");
const secondAyahSelect = document.getElementById("second-ayah");
const firstAyahSelect = document.getElementById("first-ayah");
const secondSurahSelect = document.getElementById("second-surah");
const firstSurahSelect = document.getElementById("first-surah");
const requirEvaluationInput = document.getElementById("requirEvaluation");
const requireBookInput = document.getElementById("requirBook");
const requirSwitch = document.getElementById("requirSwitch");
const requirQuantityDetailInput = document.getElementById(
  "requirQuantityDetail"
);
const requirQuantityInput = document.getElementById("requirQuantity");
const requirTypeInput = document.getElementById("requirType");

const requirMoyenneInput = document.getElementById("requirMoyenne");
const clothingInput = document.getElementById("clothing");
const haircutInput = document.getElementById("haircut");
const behaviorInput = document.getElementById("behavior");
const prayerInput = document.getElementById("prayer");
const studentNameInput = document.getElementById("studentName");

const classroomIdInput = document.getElementById("classroomId");
const mosqueInput = document.getElementById("mosque");
const placeInput = document.getElementById("place");
const sexInput = document.getElementById("sex");
const levelInput = document.getElementById("level");

const studentIdInput = document.getElementById("studentId");
const nameInput = document.getElementById("name");
const birthyearInput = document.getElementById("birthyear");
const parentPhoneInput = document.getElementById("parentPhone");

const newStudentInfosForm = document.getElementById("newStudentInfosForm");
const newClassroomInfosForm = document.getElementById("newClassroomInfosForm");
const studentDayForm = document.getElementById("studentDayForm");
const studentDayFormSubmitBtn = document.getElementById(
  "studentDayFormSubmitBtn"
);

const statisticType = document.getElementById("statisticType");

const themeSelector = document.getElementById("themeSelector");
const themeTag = document.getElementById("themeStylesheet");

const loadingModalText = document.getElementById("loadingText");
const loadingModalElement = document.getElementById("loadingModal");
const loadingModal = new bootstrap.Modal(loadingModalElement);
const newStudentDayModal = new bootstrap.Modal(
  document.getElementById("newStudentDayModal")
);
const studentInfosModal = new bootstrap.Modal(
  document.getElementById("newStudentInfosModal")
);
const newClassroomInfosModal = new bootstrap.Modal(
  document.getElementById("newClassroomInfosModal")
);

document.addEventListener("DOMContentLoaded", async function () {
  // theme selector
  themeSelector.onchange = async function () {
    const theme = this.value;
    themeTag.href = `https://cdnjs.cloudflare.com/ajax/libs/bootswatch/5.3.8/${theme}/bootstrap.rtl.min.css`;
    localStorage.setItem("selectedTheme", theme);

    // Optimize theme-specific style injection/removal
    const styleId = "slateThemeStyle";
    let styleNode = document.getElementById(styleId);

    if (theme === "slate") {
      if (!styleNode) {
        styleNode = document.createElement("style");
        styleNode.id = styleId;
        styleNode.textContent = `
        .btn, .form-select,.form-control, .input-group-text {
          padding-bottom: 4px !important;
          padding-top: 4px !important;
        }
      `;
        document.head.appendChild(styleNode);
      }
    } else if (styleNode) {
      styleNode.remove();
    }
  };
  const savedTheme = localStorage.getItem("selectedTheme");
  if (savedTheme) {
    themeSelector.value = savedTheme;
    themeSelector.dispatchEvent(new Event("change"));
  }

  // set birthyear input limits
  const today = new Date();
  $("#birthyear").yearpicker({
    endYear: today.getFullYear() - 3,
    startYear: today.getFullYear() - 97,
  });
});

// --- IndexedDB Promisified ---
function openDatabaseAsync() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(PROJECT_DB_KEY, 1);
    request.onupgradeneeded = function (event) {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(DB_STORE_NAME)) {
        db.createObjectStore(DB_STORE_NAME);
      }
    };
    request.onsuccess = function () {
      resolve(request.result);
    };
    request.onerror = function (e) {
      reject(e.target.error);
    };
  });
}

async function saveToIndexedDB(data, db_key = PROJECT_DB_KEY) {
  const idb = await openDatabaseAsync();
  return new Promise((resolve, reject) => {
    const tx = idb.transaction(DB_STORE_NAME, "readwrite");
    const store = tx.objectStore(DB_STORE_NAME);
    store.put(data, db_key);
    tx.oncomplete = () => {
      idb.close();
      resolve();
    };
    tx.onerror = (e) => {
      idb.close();
      reject(e.target.error);
    };
  });
}

async function loadFromIndexedDB(callback) {
  const idb = await openDatabaseAsync();
  return new Promise((resolve) => {
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
        resolve();
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
      projectResult = null;
      projectDone = true;
      maybeCallback();
    };
    getQuranRequest.onerror = () => {
      quranResult = null;
      quranDone = true;
      maybeCallback();
    };
  });
}

// --- File Reading Async ---
async function loadDBFromFile(file) {
  const arrayBuffer = await file.arrayBuffer();
  try {
    project_db = new SQL.Database(new Uint8Array(arrayBuffer));
    await saveToIndexedDB(project_db.export());
    window.showToast("success", "تم تحميل قاعدة البيانات.");
    setTimeout(() => window.location.reload(), 1000);
  } catch (e) {
    hideLoadingModal();
    console.error("Error loading DB from file:", e);
    throw e;
  }
}

// --- Fetch and Read File Async ---
async function fetchAndPutIntoIndexedDBFile(
  db_key,
  url,
  onSuccessCallback = function () {}
) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch file from:" + url);
    const blob = await response.blob();
    const uInt8Array = new Uint8Array(await blob.arrayBuffer());
    const db = new SQL.Database(uInt8Array);
    await saveToIndexedDB(db.export(), db_key);
    onSuccessCallback(db);
    return true;
  } catch (error) {
    console.error("Error reading file:" + error);
    return false;
  }
}

// --- Export DB Async ---
async function exportDB() {
  const data = project_db.export();
  download(data, "quran_students.sqlite3", "application/x-sqlite3");
}

// --- Initialization Async ---
async function init() {
  SQL = await initSqlJs({
    locateFile: (file) =>
      `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.13.0/${file}`,
  });

  await loadFromIndexedDB(async (savedProjectData, savedQuranData) => {
    if (savedProjectData) {
      project_db = new SQL.Database(new Uint8Array(savedProjectData));
      if (savedQuranData) {
        quran_db = new SQL.Database(new Uint8Array(savedQuranData));
      } else {
        if (!(await downloadQuranDB())) {
          window.showToast(
            "error",
            "فشل في إنشاء قاعدة بيانات جديدة، تأكد من الاتصال بالإنترنت."
          );
          return;
        }
      }
      localStorage.setItem("newUser", false);
      await initializeAyatdata(quran_db);
      await dayDatePickerInit();
      showTab("pills-home");
      nav_bar.style.removeProperty("display");
    } else {
      showTab("pills-splash");
    }
  });
}

// --- Download Quran DB Async ---
async function downloadQuranDB() {
  return await fetchAndPutIntoIndexedDBFile(
    QURAN_DB_KEY,
    "./assets/quran.sqlite",
    async (db) => {
      quran_db = db;
      await initializeAyatdata(db);
      await dayDatePickerInit();
    }
  );
}

// --- Async Utility for DataTable Reload ---
async function initOrReloadDataTable(
  selector,
  data,
  columns,
  options = {},
  TableDetailIsShow = false,
  shoulDestroy = false
) {
  if ($.fn.DataTable.isDataTable(selector)) {
    if (shoulDestroy) {
      $(selector).DataTable().destroy();
      $(selector).empty();
    } else {
      return $(selector).DataTable().clear().rows.add(data).draw();
    }
  }
  const table = new DataTable(selector, {
    data,
    columns,
    ...options,
  });

  if (TableDetailIsShow) {
    table.buttons(0).trigger();
  }
  return table;
}

// show loading modal
function setLoadingModalText(text) {
  if (text) {
    loadingModalText.style.display = "block";
    loadingModalText.innerText = text + "...";
  } else {
    loadingModalText.style.display = "none";
  }
}

function showLoadingModal(text = null) {
  setLoadingModalText(text);
  loadingModalShowNumber.push(text);
  if (loadingModalShowNumber.length > 1) return;

  return new Promise((resolve) => {
    // Listen for when modal is fully shown
    const handleShown = () => {
      loadingModalElement.removeEventListener("shown.bs.modal", handleShown);
      resolve(loadingModal);
    };

    loadingModalElement.addEventListener("shown.bs.modal", handleShown);
    loadingModal.show();
  });
}

async function hideLoadingModal() {
  loadingModalShowNumber.pop();
  if (!loadingModalShowNumber.length) {
    loadingModal.hide();
  } else {
    setLoadingModalText(
      loadingModalShowNumber[loadingModalShowNumber.length - 1]
    );
  }
}
// --- Event Handlers Async ---
async function createNewDB() {
  if (
    project_db &&
    !confirm("سيتم استبدال قاعدة البيانات الحالية. هل أنت متأكد؟")
  ) {
    return;
  }
  await showLoadingModal("جاري إنشاء قاعدة بيانات جديدة");
  if (
    !(await fetchAndPutIntoIndexedDBFile(
      PROJECT_DB_KEY,
      "./assets/default.sqlite3",
      (db) => {
        project_db = db;
      }
    )) ||
    !(await downloadQuranDB())
  ) {
    hideLoadingModal();
    window.showToast(
      "error",
      "فشل في إنشاء قاعدة بيانات جديدة، تأكد من الاتصال بالإنترنت."
    );
    return;
  }
  window.showToast("success", "تم إنشاء قاعدة بيانات جديدة.");
  window.location.reload();
}

async function googleSignin() {
  if (!navigator.onLine) {
    window.showToast("warning", "لا يوجد اتصال بالإنترنت.");
    return;
  }
  await showLoadingModal("جاري تسجيل الدخول");
  await initializeGoogleAuth(async (accessToken) => {
    try {
      const downloadResult = await downloadDBfromDrive();
      if (downloadResult == null) {
        if (confirm(`لاتوجد ملفات سابقة، هل تريد إنشاء قاعدة جديدة؟`)) {
          await createNewDB();
        }
      } else if (downloadResult == false) {
        if (project_db) await asyncDB();
      } else {
        await loadDBFromFile(downloadResult);
      }
    } catch (e) {
      console.log(e.message);
      window.showToast("error", e.message);
    }
  });
  hideLoadingModal();
}

document.getElementById("downloadDBbtn").onclick = exportDB;
document.getElementById("createNewDBbtn").onclick = createNewDB;
document.getElementById("importDBbtn").onchange = async (e) => {
  if (e.target.files) {
    if (
      project_db &&
      !confirm("سيتم استبدال قاعدة البيانات الحالية. هل أنت متأكد؟")
    ) {
      e.target.value = "";
      return;
    }
    await showLoadingModal("جاري استيراد قاعدة البيانات");
    try {
      await loadDBFromFile(e.target.files[0]);
    } catch (e) {
      window.showToast(
        "error",
        "فشل في استرداد قاعدة البيانات. تأكد من صحة الملف."
      );
    }
  }
};

async function asyncDB() {
  if (!navigator.onLine) {
    window.showToast("warning", "لا يوجد اتصال بالإنترنت.");
    return;
  }

  if (project_db) {
    await showLoadingModal("جاري المزامنة");
    try {
      if (await uploadDBtoDrive(project_db.export()))
        window.showToast("success", "تمت المزامنة بنجاح.");
    } catch (e) {
      console.log(e);
      window.showToast("error", e.message);
    }
    hideLoadingModal();
  }
}
// classrooms tab
workingClassroomSelect.onchange = async function () {
  workingClassroomId = this.value;
  localStorage.setItem("workingClassroomId", workingClassroomId);
  setIsCustomDate();
};
newClassroomInfosForm.onsubmit = (e) => {
  e.preventDefault();
  if (!project_db) {
    window.showToast("info", "لا يوجد قاعدة بيانات مفتوحة.");
    return;
  }
  const mosque = mosqueInput.value;
  const place = placeInput.value;
  const sex = sexInput.value;
  const level = levelInput.value;

  if (!mosque || !place || !sex || !level) {
    window.showToast("error", "الرجاء ملء جميع الحقول.");
    return;
  }
  try {
    if (classroomIdInput.value) {
      project_db.run(
        "UPDATE class_rooms SET mosque = ?, place = ?, sex = ? ,level = ? WHERE id = ?;",
        [mosque, place, sex, level, classroomIdInput.value]
      );
      window.showToast("success", "تم تعديل الطالب بنجاح.");
    } else {
      project_db.run(
        "INSERT INTO class_rooms (mosque, place, sex, level) VALUES (?, ?, ?,?);",
        [mosque, place, sex, level]
      );
      newClassroomInfosForm.reset();
      window.showToast("success", "تم إضافة الطالب بنجاح.");
    }
    saveToIndexedDB(project_db.export());
    newClassroomInfosModal.hide();
    loadClassRoomsList();
  } catch (e) {
    window.showToast("error", "Error: " + e.message);
  }
};

async function loadClassRoomsList() {
  if (!project_db) {
    window.showToast("info", "لا يوجد قاعدة بيانات مفتوحة.");
    return;
  }
  try {
    workingClassroomSelect.options.length = 0;
    const results = project_db.exec("SELECT * FROM class_rooms;");
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
          newClassroomInfosModal.show();
          const classroomId = row[0];
          const result = project_db.exec(
            "SELECT * FROM class_rooms WHERE id = ?;",
            [classroomId]
          );
          classroomIdInput.value = classroomId;
          mosqueInput.value =
            result[0].values[0][result[0].columns.indexOf("mosque")];
          placeInput.value =
            result[0].values[0][result[0].columns.indexOf("place")];
          sexInput.value =
            result[0].values[0][result[0].columns.indexOf("sex")];
          levelInput.value =
            result[0].values[0][result[0].columns.indexOf("level")];
        };
        button_group.appendChild(editBtn);

        // Delete
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "btn btn-danger btn-sm";
        deleteBtn.type = "button";
        deleteBtn.innerHTML = '<i class="fa-solid fa-user-slash"></i> حذف';
        CreateOnClickUndo(deleteBtn, function () {
          const studentId = row[0];
          if (!confirm("هل أنت متأكد أنك تريد حذف هذا القسم؟")) {
            return;
          }
          if (!project_db) {
            window.showToast("info", "لا يوجد قاعدة بيانات مفتوحة.");
            return;
          }
          try {
            project_db.run("DELETE FROM class_rooms WHERE id = ?;", [
              studentId,
            ]);
            saveToIndexedDB(project_db.export());
            deleteTableRow("#classroomsListTable", "id", row[0]);
            window.showToast("success", "تم حذف الطالب بنجاح.");
          } catch (e) {
            window.showToast("warning", "Error: " + e.message);
          }
        });
        button_group.appendChild(deleteBtn);

        // Prepare classroom display string
        const displayText = [
          row[result.columns.indexOf("place")],
          row[result.columns.indexOf("mosque")],
          row[result.columns.indexOf("sex")],
          row[result.columns.indexOf("level")],
        ];

        data.push({
          id: row[0],
          mosque: displayText[1],
          place: displayText[0],
          sex: displayText[2],
          level: displayText[3],
          actions: button_group,
        });

        // Add option to select efficiently
        workingClassroomSelect.add(new Option(displayText.join(" - "), row[0]));
      });
      if (workingClassroomId) {
        workingClassroomSelect.value = workingClassroomId;
      } else {
        workingClassroomSelect.options[0].selected = true;
        workingClassroomSelect.dispatchEvent(new Event("change"));
      }
    }
    await initOrReloadDataTable(
      "#classroomsListTable",
      data,
      [
        { data: "id" },
        { data: "mosque" },
        { data: "place" },
        { data: "sex" },
        { data: "level" },
        { data: "actions" },
      ],
      {
        destroy: true,
        columnDefs: [
          { visible: false, targets: [0, 4, 5] },
          {
            targets: 5,
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

        layout: {
          topStart: {
            buttons: [
              {
                text: "إظهار التفاصيل",
                action: function (e, dt, button, config) {
                  const columns = dt.columns([0, 4, 5]);
                  const isVisible = dt.column(columns[0][0]).visible();

                  columns.visible(!isVisible);
                  classroomsTableDetailIsShow = !isVisible;
                  dt.button(0).text(
                    isVisible ? "إظهار التفاصيل" : "إخفاء التفاصيل"
                  );
                },
              },
              {
                text: "إضافة ✚",
                className: "btn btn-primary",
                attr: {
                  "data-bs-toggle": "modal",
                  "data-bs-target": "#newClassroomInfosModal",
                },
              },
            ],
          },
        },
      },
      classroomsTableDetailIsShow
    );
  } catch (e) {
    window.showToast("warning", "Error: " + e.message);
  }
}
// students tab
async function loadStudentsList() {
  if (!project_db) {
    window.showToast("info", "لا يوجد قاعدة بيانات مفتوحة.");
    return;
  }
  try {
    const results = project_db.exec(
      "SELECT * FROM students WHERE class_room_id = ?;",
      [workingClassroomId]
    );
    const data = [];
    if (results.length) {
      const result = results[0];
      result.values.forEach((row) => {
        // action buttons
        const action_button_group = document.createElement("div");
        action_button_group.className = "btn-group";
        action_button_group.setAttribute("role", "group");
        action_button_group.setAttribute("aria-label", "Basic example");
        // Edit
        const editBtn = document.createElement("button");
        editBtn.className = "btn btn-info btn-sm";
        editBtn.innerHTML = '<i class="fa-solid fa-user-pen"></i> تعديل';
        editBtn.onclick = function () {
          studentInfosModal.show();
          const studentId = row[0];
          const result = project_db.exec(
            "SELECT * FROM students WHERE id = ?;",
            [studentId]
          );
          studentIdInput.value = studentId;
          nameInput.value =
            result[0].values[0][result[0].columns.indexOf("name")];
          birthyearInput.value =
            result[0].values[0][result[0].columns.indexOf("birthyear")];
          parentPhoneInput.value =
            result[0].values[0][result[0].columns.indexOf("parent_phone")];
        };
        action_button_group.appendChild(editBtn);
        // Delete
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "btn btn-danger btn-sm";
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
            deleteTableRow("#studentsListTable", "id", row[0]);
            window.showToast("success", "تم حذف الطالب بنجاح.");
          } catch (e) {
            window.showToast("warning", "Error: " + e.message);
          }
        });
        action_button_group.appendChild(deleteBtn);

        // phone buttons
        let phone_button_group = "غير متوفر";
        if (row[result.columns.indexOf("parent_phone")]) {
          phone_button_group = document.createElement("div");
          phone_button_group.className = "btn-group";
          phone_button_group.setAttribute("role", "group");
          phone_button_group.setAttribute("aria-label", "Basic example");
          // call
          const callBtn = document.createElement("a");
          callBtn.href = "tel:" + row[result.columns.indexOf("parent_phone")];
          callBtn.className = "btn btn-success btn-sm";
          callBtn.innerHTML = '<i class="fa-solid fa-phone-flip"></i>';
          phone_button_group.appendChild(callBtn);
          // sms
          const smsBtn = document.createElement("a");
          smsBtn.href = "sms:" + row[result.columns.indexOf("parent_phone")];
          smsBtn.className = "btn btn-info btn-sm";
          smsBtn.innerHTML = '<i class="fa-solid fa-comment-sms"></i>';
          phone_button_group.appendChild(smsBtn);
        }

        data.push({
          id: row[0],
          name: row[result.columns.indexOf("name")],
          age: Math.abs(
            moment().diff(
              moment(new Date(row[result.columns.indexOf("birthyear")])),
              "years"
            )
          ),
          parentPhone: phone_button_group,
          actions: action_button_group,
        });
      });
    }

    await initOrReloadDataTable(
      "#studentsListTable",
      data,
      [
        { data: "id" },
        { data: "name" },
        { data: "age" },
        { data: "parentPhone" },
        { data: "actions" },
      ],
      {
        destroy: true,
        columnDefs: [
          { visible: false, targets: [4] },
          {
            targets: [4, 3],
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

        layout: {
          topStart: {
            buttons: [
              {
                text: "إظهار التفاصيل",
                action: function (e, dt) {
                  const columns = dt.columns([4]);
                  const isVisible = dt.column(columns[0][0]).visible();

                  columns.visible(!isVisible);
                  studentsTableDetailIsShow = !isVisible;
                  dt.button(0).text(
                    isVisible ? "إظهار التفاصيل" : "إخفاء التفاصيل"
                  );
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
      },
      studentsTableDetailIsShow
    );
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
  const birthyear = birthyearInput.value;
  const parentPhone = parentPhoneInput.value;

  if (!name || !birthyear) {
    window.showToast("error", "الرجاء ملء جميع الحقول.");
    return;
  }
  if (parentPhone && !/^(05|06|07)\d{8}$/.test(parentPhone)) {
    window.showToast(
      "error",
      "رقم الهاتف غير صالح. يجب أن يبدأ بـ 05 أو 06 أو 07 ويتكون من 10 أرقام."
    );
    return;
  }
  try {
    if (studentIdInput.value) {
      project_db.run(
        "UPDATE students SET name = ?, birthyear = ?, parent_phone = ? WHERE id = ?;",
        [name, birthyear, parentPhone, studentIdInput.value]
      );
      window.showToast("success", "تم تعديل الطالب بنجاح.");
    } else {
      project_db.run(
        "INSERT INTO students (name, birthyear, parent_phone, class_room_id) VALUES (?, ?, ?,?);",
        [name, birthyear, parentPhone, workingClassroomId]
      );
      newStudentInfosForm.reset();
      studentIdInput.value = "";
      window.showToast("success", "تم إضافة الطالب بنجاح.");
    }
    saveToIndexedDB(project_db.export());
    studentInfosModal.hide();
    loadStudentsList();
  } catch (e) {
    window.showToast("error", "Error: " + e.message);
  }
});

document
  .getElementById("newStudentInfosModal")
  .addEventListener("show.bs.modal", function () {
    newStudentInfosForm.reset();
    studentIdInput.value = "";
  });

document
  .getElementById("newClassroomInfosModal")
  .addEventListener("show.bs.modal", function () {
    newClassroomInfosForm.reset();
    classroomIdInput.value = "";
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
  .getElementById("newClassroomInfosModal")
  .addEventListener("shown.bs.modal", function () {
    const submitButton = document.querySelector(
      "#newClassroomInfosModal [type='submit']"
    );
    if (classroomIdInput.value) {
      submitButton.textContent = "تحديث";
    } else {
      submitButton.textContent = "إظافة";
    }
  });

requireBookInput.onchange = function () {
  const quranSelectionSection = document.getElementById(
    "quranSelectionSection"
  );

  if (this.value === "القرآن") {
    quranSelectionSection.style.removeProperty("display");
    requirQuantityDetailInput.style.display = "none";
    requirQuantityInput.readOnly = true;
  } else {
    requirQuantityDetailInput.style.removeProperty("display");
    quranSelectionSection.style.display = "none";
    requirQuantityInput.readOnly = false;
  }
  requirQuantityDetailInput.value = "";
  requirQuantityInput.value = "";
};

attendanceInput.onchange = function () {
  const elementsToDisable = [
    "studentName",
    "requirBook",
    "requirType",
    "requirQuantity",
    "requirEvaluation",
    "requirMoyenne",
    "requirQuantityDetail",
    "clothing",
    "haircut",
    "behavior",
    "prayer",
    "addQuranSelectionBtn",
  ].map((id) => document.getElementById(id));
  const disable = this.value === "1";
  elementsToDisable.forEach((element) => {
    element.disabled = disable;
  });
  requireBookInput.value = "";
  requireBookInput.dispatchEvent(new Event("change"));
  if (disable == "1") {
    requirSwitch.disabled = true;
  } else {
    requirSwitch.disabled = false;
  }
};

function calcRequirementMoyenne(quantity, evaluation, type) {
  let value = 0;
  if (type === "حفظ") {
    value = evaluation * quantity;
  } else if (type === "مراجعة") {
    value = evaluation * (quantity / 3);
  }
  return value ? value.toFixed(2) : "";
}

function calcRequirementsMoyenne() {
  let moyenne = 0;
  const headers = Array.from(
    requirementsTable.querySelectorAll("thead th")
  ).map((header) => header.textContent.trim());
  const rows = requirementsTable.querySelectorAll("tbody tr");
  rows.forEach((row) => {
    const cells = row.querySelectorAll("td");
    const rowData = {};
    cells.forEach((cell, index) => {
      const key = headers[index];
      if (key && key == "المعدل")
        moyenne += parseFloat(cell.textContent.trim() || "0");
    });
  });
  moyenne = moyenne / (rows.length || 1);
  return moyenne ? moyenne.toFixed(2) : "";
}

function calcEvaluationMoyenne(
  attendance,
  clothing,
  haircut,
  behavior,
  prayer
) {
  let moyenne = 0;
  moyenne += parseFloat(attendance) || 0;
  moyenne += parseFloat(clothing) || 0;
  moyenne += parseFloat(haircut) || 0;
  moyenne += parseFloat(behavior) || 0;
  moyenne += parseFloat(prayer) || 0;
  return moyenne ? (moyenne / 5).toFixed(2) : "";
}

function update_student_day_notes(studentId) {
  if (!project_db) {
    window.showToast("info", "لا يوجد قاعدة بيانات مفتوحة.");
    return;
  }
  if (attendanceInput.value !== "1") {
    const headers = Array.from(
      requirementsTable.querySelectorAll("thead th")
    ).map((header) => header.textContent.trim());
    const rows = requirementsTable.querySelectorAll("tbody tr");
    const requirList = [];
    rows.forEach((row) => {
      const cells = row.querySelectorAll("td");
      const rowData = {};
      cells.forEach((cell, index) => {
        const key = headers[index];
        if (key) rowData[key] = cell.textContent.trim();
      });
      requirList.push(rowData);
    });

    if (requirList.length) {
      project_db.run(
        "INSERT OR REPLACE INTO day_requirements (student_id, day_id, detail, moyenne) VALUES (?, ?, ?, ?);",
        [
          studentId,
          currentDay,
          JSON.stringify(requirList),
          requirMoyenneInput.value || "0",
        ]
      );
    } else {
      project_db.run(
        "DELETE FROM day_requirements WHERE student_id = ? AND day_id = ?;",
        [studentId, currentDay]
      );
    }

    project_db.run(
      "INSERT OR REPLACE INTO day_evaluations (student_id, day_id, attendance,clothing,haircut,behavior,prayer,moyenne) VALUES (?, ?, ?, ?,?,?,?,?);",
      [
        studentId,
        currentDay,
        attendanceInput.value,
        clothingInput.value,
        haircutInput.value,
        behaviorInput.value,
        prayerInput.value,
        calcEvaluationMoyenne(
          attendanceInput.value,
          clothingInput.value,
          haircutInput.value,
          behaviorInput.value,
          prayerInput.value
        ),
      ]
    );
  } else {
    project_db.run(
      "DELETE FROM day_evaluations WHERE student_id = ? AND day_id = ?;",
      [studentId, currentDay]
    );
  }
  saveToIndexedDB(project_db.export());
  loadDayStudentsList();
}

function setAttendance(studentId) {}

async function addNewDay() {
  if (!project_db) {
    indow.showToast("info", "لا يوجد قاعدة بيانات مفتوحة....");
    return;
  }
  project_db.run(
    "INSERT OR REPLACE INTO education_day (date,time, notes,class_room_id) VALUES (?,?, ?,?);",
    [
      currentDay,
      new Date().toISOString().slice(11, 19),
      null,
      workingClassroomId,
    ]
  );
  saveToIndexedDB(project_db.export());
  setIsCustomDate();
  await loadDayStudentsList();
}

async function loadDayStudentsList() {
  dayNoteContainer.style.display = "none";
  if (!project_db) {
    window.showToast("info", "لا يوجد قاعدة بيانات مفتوحة....");
    return;
  }

  const dayResult = project_db.exec(
    `SELECT * FROM education_day WHERE class_room_id = ? AND date = ?`,
    [workingClassroomId, currentDay]
  );
  if (!dayResult.length) {
    if ($.fn.DataTable.isDataTable("#dayListTable")) {
      $("#dayListTable").DataTable().destroy();
    }
    document.getElementById("addNewDayBtn").style.display = "block";
    document.getElementById("dayListTable").style.display = "none";
    return;
  }

  const dayNote =
    dayResult[0].values[0][dayResult[0].columns.indexOf("notes")] || "";
  dayNoteContainer.style.display = dayNote ? "block" : "none";
  dayNoteContainer.innerHTML = `<em>${dayNote}</em>`;

  document.getElementById("dayListTable").style.display = "block";
  document.getElementById("addNewDayBtn").style.display = "none";

  try {
    const results = project_db.exec(`
      SELECT 
          s.id AS studentId,  
          s.name AS studentName,
          s.parent_phone AS parentPhone,
          dr.detail AS "detail",
          dr.moyenne AS "requirsMoyenne",
          de.attendance AS "attendance",
          de.clothing AS "clothing", 
          de.haircut AS "haircut",
          de.behavior AS "behavior",
          de.prayer AS "prayer",
          de.moyenne AS "evalMoyenne"	
      FROM students s
      LEFT JOIN day_requirements dr ON s.id = dr.student_id AND dr.day_id = '${currentDay}'
      LEFT JOIN day_evaluations de ON s.id = de.student_id AND de.day_id = '${currentDay}'
      WHERE s.class_room_id = ${workingClassroomId}
      GROUP BY s.id, s.name
      ORDER BY s.id
      LIMIT 100`);

    const data = [];
    if (results.length) {
      const result = results[0];

      result.values.forEach((row) => {
        const editBtn = document.createElement("button");
        editBtn.className = "btn btn-sm btn-primary";
        editBtn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>';
        editBtn.onclick = function () {
          newStudentDayModal.show();
          studentNameInput.value = row[result.columns.indexOf("studentName")];
          requirementsTable.querySelector("tbody").innerHTML = "";
          JSON.parse(row[result.columns.indexOf("detail")] || "[]").forEach(
            (item) => {
              const row = document.createElement("tr");
              row.innerHTML = `
                <td>${item["الكتاب"]}</td>
                <td>${item["النوع"]}</td>
                <td class="d-none">${item["المقدار"]}</td>
                <td style="white-space: normal;">${item["التفاصيل"]}</td>
                <td>${item["التقدير"]}</td>
                <td>${item["المعدل"]}</td>
                <td>${item["الحالة"] || "إضافي"}</td>
                <td><button class="btn btn-danger btn-sm" onclick="removeRequirItem(this)">X</button></td>`;
              requirementsTable.querySelector("tbody").appendChild(row);
            }
          );

          attendanceInput.value =
            row[result.columns.indexOf("attendance")] || "1";
          attendanceInput.dispatchEvent(new Event("change"));

          requirMoyenneInput.value =
            row[result.columns.indexOf("requirsMoyenne")] || "0";

          clothingInput.value = row[result.columns.indexOf("clothing")];
          haircutInput.value = row[result.columns.indexOf("haircut")];
          behaviorInput.value = row[result.columns.indexOf("behavior")];
          prayerInput.value = row[result.columns.indexOf("prayer")];

          studentDayForm.onsubmit = function (e) {
            e.preventDefault();
            if (!project_db) {
              window.showToast("info", "لا يوجد قاعدة بيانات مفتوحة.");
              return;
            }
            update_student_day_notes(row[result.columns.indexOf("studentId")]);
            newStudentDayModal.hide();
          };
        };
        const attendance_value = row[result.columns.indexOf("attendance")];
        const attendanceOption = document.querySelector(
          `#attendance option[value='${attendance_value}']`
        );
        const clothingOption = document.querySelector(
          `#clothing option[value='${row[result.columns.indexOf("clothing")]}']`
        );
        const haircutOption = document.querySelector(
          `#haircut option[value='${row[result.columns.indexOf("haircut")]}']`
        );
        const behaviorOption = document.querySelector(
          `#behavior option[value='${row[result.columns.indexOf("behavior")]}']`
        );
        const prayerOption = document.querySelector(
          `#prayer option[value='${row[result.columns.indexOf("prayer")]}']`
        );

        data.push({
          id: row[result.columns.indexOf("studentId")],
          actions: editBtn,
          student: row[result.columns.indexOf("studentName")],
          attendance: attendanceOption
            ? attendanceOption.textContent
            : "غائب" +
              (row[result.columns.indexOf("parentPhone")]
                ? `<input type="checkbox" id="sms_btn${
                    row[result.columns.indexOf("studentId")]
                  }" onclick="window.location.href='sms:${
                    row[result.columns.indexOf("parentPhone")]
                  }?body=ليكن في علمكم أن إبنكم ${
                    row[result.columns.indexOf("studentName")]
                  } غائب اليوم'" class="btn-check" autocomplete="off">
              <label class="btn fa-solid fa-comment-sms px-2" for="sms_btn${
                row[result.columns.indexOf("studentId")]
              }"></label>`
                : ""),
          book: attendanceOption ? "" : "/",
          type: attendanceOption ? "" : "/",
          quantity: attendanceOption ? "" : "/",
          evaluation: attendanceOption ? "" : "/",
          clothing: attendanceOption
            ? clothingOption
              ? clothingOption.textContent
              : ""
            : "/",

          haircut: attendanceOption
            ? haircutOption
              ? haircutOption.textContent
              : ""
            : "/",
          behavior: attendanceOption
            ? behaviorOption
              ? behaviorOption.textContent
              : ""
            : "/",
          prayer: attendanceOption
            ? prayerOption
              ? prayerOption.textContent
              : ""
            : "/",
        });
      });
    } else {
      window.showToast("success", "لا يوجد تلاميذ.");
      showTab("pills-students");
      return;
    }
    await initOrReloadDataTable(
      "#dayListTable",
      data,
      [
        { data: "id" },
        { data: "actions" },
        { data: "student" },
        { data: "attendance" },
        { data: "book", defaultContent: "/" },
        { data: "type", defaultContent: "/" },
        { data: "quantity", defaultContent: "/" },
        { data: "evaluation", defaultContent: "/" },
        { data: "clothing", defaultContent: "/" },
        { data: "haircut", defaultContent: "/" },
        { data: "behavior", defaultContent: "/" },
        { data: "prayer", defaultContent: "/" },
      ],
      {
        destroy: true,
        searching: false,
        scrollX: true,
        info: false,
        oLanguage: {
          sSearch: "بحث",
          emptyTable: "لا توجد بيانات في الجدول.",
        },
        paging: false,
        responsive: true,

        columnDefs: [
          { visible: false, targets: [...[0], ...[6, 7, 8, 9, 10, 11]] },
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
                action: function (e, dt) {
                  const columns = dt.columns([6, 7, 8, 9, 10, 11]);
                  const isVisible = dt.column(columns[0][0]).visible();

                  columns.visible(!isVisible);
                  studentsDayTableDetailIsShow = !isVisible;
                  dt.button(0).text(
                    isVisible ? "إظهار التفاصيل" : "إخفاء التفاصيل"
                  );
                },
              },
              {
                text: "ملاحظة اليوم",
                action: function () {
                  let note = prompt("أكتب ملاحظة:", dayNote);
                  if (note !== null) {
                    if (!project_db) {
                      window.showToast("info", "لا يوجد قاعدة بيانات مفتوحة.");
                      return;
                    }
                    try {
                      project_db.run(
                        "UPDATE education_day SET notes = ? WHERE class_room_id = ? AND date = ?;",
                        [note, workingClassroomId, currentDay]
                      );
                      saveToIndexedDB(project_db.export());
                      dayNoteContainer.style.display = note ? "block" : "none";
                      dayNoteContainer.innerHTML = `<em>${note}</em>`;
                    } catch (e) {
                      window.showToast("error", "Error: " + e.message);
                    }
                  } else {
                    window.showToast("error", "لم يتم حفظ الملاحظة.");
                  }
                },
              },
              {
                text: "إلغاء اليوم",
                action: function () {
                  if (confirm("هل تريد إلغاء هذا اليوم ؟")) {
                    project_db.run(
                      "DELETE FROM day_evaluations WHERE day_id = ?;",
                      [currentDay]
                    );
                    project_db.run(
                      "DELETE FROM day_requirements WHERE day_id = ?;",
                      [currentDay]
                    );
                    project_db.run(
                      "DELETE FROM education_day WHERE class_room_id = ? AND date = ?;",
                      [workingClassroomId, currentDay]
                    );
                    saveToIndexedDB(project_db.export());
                    setIsCustomDate();
                    loadDayStudentsList();
                  }
                },
              },
            ],
          },
        },
      },
      studentsDayTableDetailIsShow
    );
  } catch (e) {
    window.showToast("error", "Error: " + e.message);
  }
}

async function dayDatePickerInit() {
  // day date picker
  dayDateInput.daterangepicker(
    {
      singleDatePicker: true,
      showDropdowns: true,
      autoUpdateInput: false,
      locale: {
        format: "YYYY-MM-DD",
        daysOfWeek: arabicDays,
        monthNames: arabicMonths,
        firstDay: 7,
        applyLabel: "تأكيد",
        cancelLabel: "إلغاء",
        customRangeLabel: "تخصيص",
      },
      maxDate: currentDay,
    },
    async function (start) {
      currentDay = start.format("YYYY-MM-DD");
      dayDateInput.val(currentDay);
      await loadDayStudentsList();
    }
  );

  // statistics date picker
  statisticsDateInput.daterangepicker(
    {
      showDropdowns: true,
      locale: {
        format: "YYYY-MM-DD",
        daysOfWeek: arabicDays,
        monthNames: arabicMonths,
        firstDay: 7,
        applyLabel: "تأكيد",
        cancelLabel: "إلغاء",
        customRangeLabel: "تخصيص",
      },
      maxDate: currentDay,
      ranges: {
        اليوم: [moment(), moment()],
        أمس: [moment().subtract(1, "days"), moment().subtract(1, "days")],
        "هذا الأسبوع": [moment().startOf("week"), moment().endOf("week")],
        "الأسبوع الماضي": [
          moment().subtract(1, "week").startOf("week"),
          moment().subtract(1, "week").endOf("week"),
        ],
        "هذا الشهر": [moment().startOf("month"), moment().endOf("month")],
        "الشهر الماضي": [
          moment().subtract(1, "month").startOf("month"),
          moment().subtract(1, "month").endOf("month"),
        ],
      },
    },
    async function (start) {
      statisticType.value = "0";
      statisticType.dispatchEvent(new Event("change"));
    }
  );
  setIsCustomDate();
}

function setIsCustomDate() {
  const result = project_db.exec(
    `SELECT date FROM education_day WHERE class_room_id = ${workingClassroomId};`
  );
  const events =
    result.length && result[0].values.length
      ? result[0].values.map((row) => row[0])
      : [];

  dayDateInput.data("daterangepicker").isCustomDate = function (date) {
    if (events.includes(date.format("YYYY-MM-DD"))) {
      return "fs-6 fw-bold";
    }
    return "";
  };

  statisticsDateInput.data("daterangepicker").isCustomDate = function (date) {
    if (events.includes(date.format("YYYY-MM-DD"))) {
      return "fs-6 fw-bold";
    }
    return "";
  };
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

function removeRequirItem(button) {
  const row = button.closest("tr");
  if (requirementsTable.querySelector("tbody").childElementCount === 1) {
    const row = document.createElement("tr");
    row.innerText = "لاتوجد واجبات";
    requirementsTable.querySelector("tbody").appendChild(row);
  }
  row.remove();
  requirMoyenneInput.value = calcRequirementsMoyenne();
}

addQuranSelectionBtn.onclick = function () {
  if (
    !requireBookInput.value ||
    !requirTypeInput.value ||
    !requirQuantityInput.value ||
    !requirEvaluationInput.value
  ) {
    window.showToast("error", "الرجاء إدخال الحقول اللازمة.");
    return;
  }
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${requireBookInput.value}</td>
    <td>${requirTypeInput.value}</td>
    <td class="d-none">${requirQuantityInput.value}</td>
    <td style="white-space: normal;">${requirQuantityDetailInput.value}</td>
    <td>${requirEvaluationInput.value}</td>
    <td>${calcRequirementMoyenne(
      requirQuantityInput.value,
      requirEvaluationInput.value,
      requirTypeInput.value
    )}</td>
    <td>
      ${requirSwitch.checked ? "واجب" : "إظافي"}
    </td>
    <td><button class="btn btn-danger btn-sm" onclick="removeRequirItem(this)">X</button></td>`;
  requirementsTable.querySelector("tbody").appendChild(row);
  requirMoyenneInput.value = calcRequirementsMoyenne();
  requireBookInput.value = "";
  requirTypeInput.value = "";
  requirQuantityInput.value = "";
  requirEvaluationInput.value = "";
  requireBookInput.dispatchEvent(new Event("change"));
  requirTypeInput.dispatchEvent(new Event("change"));
  requirQuantityInput.dispatchEvent(new Event("change"));
  requirEvaluationInput.dispatchEvent(new Event("change"));
};

async function showTab(tabId) {
  document
    .querySelectorAll(".tab-pane")
    .forEach((el) => el.classList.remove("show", "active"));
  document.getElementById(tabId).classList.add("show", "active");

  if (tabId === "pills-splash") {
    nav_bar.style.display = "none";
  } else if (tabId === "pills-home") {
    await loadClassRoomsList();
  } else if (tabId === "pills-preferences") {
    if (!loginStatus.innerHTML) initAuth();
  } else if (workingClassroomId) {
    if (tabId === "pills-students") {
      await loadStudentsList();
      newStudentInfosForm.reset();
      studentIdInput.value = "";
    } else if (tabId === "pills-new_day") {
      if (!dayDateInput.val()) {
        dayDateInput.val(new Date().toISOString().slice(0, 10));
      }
      await loadDayStudentsList();
      newStudentDayModal.hide();
    } else if (tabId === "pills-statistics") {
      // Optionally load statistics
    }
  } else {
    showTab("pills-home");
    window.showToast("warning", "الرجاء إختيار قسم.");
  }
}

function getDatesInRange() {
  const result = project_db.exec(
    `SELECT date FROM education_day WHERE class_room_id = ${workingClassroomId};`
  );
  if (result.length && result[0].values.length) {
    const [startDateStr, endDateStr] = statisticsDateInput
      .val()
      .split(" - ")
      .map((str) => str.trim());
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    return result[0].values
      .map((row) => row[0])
      .filter((dateStr) => {
        const currentDate = new Date(dateStr);
        return currentDate >= startDate && currentDate <= endDate;
      });
  }
  return [];
}

statisticType.onchange = function () {
  switch (this.value) {
    case "attendance":
      showAttendanceStatistics();
      break;
    default:
      if ($.fn.DataTable.isDataTable("#statisticsTable")) {
        $("#statisticsTable").DataTable().destroy();
        $("#statisticsTable").empty();
      }
  }
};
async function showAttendanceStatistics() {
  const dates = [...getDatesInRange()].sort(
    (a, b) => new Date(a) - new Date(b)
  );
  if (!dates.length) {
    window.showToast("warning", "لا توجد أيام في هذا النطاق.");
    return;
  }

  let datesHeader = "";
  for (d of dates) {
    datesHeader += `MAX(CASE WHEN de.day_id = '${d}' THEN CASE WHEN de.attendance = 1 THEN 'غ' ELSE 'ح' END
    ELSE 'غ' END) as "${d}",`;
  }

  const result = project_db.exec(
    `SELECT 
        s.id as "#", s.name as "اسم الطالب",
        ${datesHeader.slice(0, -1)}
    FROM students s
    LEFT JOIN day_evaluations de ON s.id = de.student_id
    LEFT JOIN education_day ed ON de.day_id = ed.id
    WHERE s.class_room_id = ${workingClassroomId}
    GROUP BY s.id, s.name
    ORDER BY s.id;`
  );
  try {
    if (result.length > 0) {
      const data = result[0];
      const columns = data.columns;
      const values = data.values;

      // Prepare data for DataTables
      const tableData = values.map((row) => {
        const rowData = {};
        columns.forEach((column, index) => {
          rowData[column] = row[index];
        });
        return rowData;
      });
      const tableColumns = columns.map((col) => ({
        data: col,
        title: col,
        className: [0, 1].includes(columns.indexOf(col))
          ? "text-center"
          : "text-center header-rotated",
      }));

      await initOrReloadDataTable(
        "#statisticsTable",
        tableData,
        tableColumns,
        {
          searching: false,
          scrollX: true,
          info: false,
          oLanguage: {
            sSearch: "بحث",
            emptyTable: "لا توجد بيانات في الجدول.",
          },
          paging: false,
          responsive: true,

          layout: {
            topStart: {
              buttons: [
                {
                  extend: "pdfHtml5",
                  download: "open",
                },
                {
                  extend: "pdf",
                  text: "انشاء PDF",
                  className: "btn btn-primary",
                  customize: function (doc) {
                    if (tableColumns.length > 20) {
                      window.showToast(
                        "warning",
                        "عدد الأعمدة كبير وقد يسبب مشكلة عند الهامش"
                      );
                    }
                    doc.content[0].text = "جدول الحضور الشهري للطلاب";
                    doc.content[0].alignment = "center";
                    doc.content[0].fontSize = 16;
                    doc.content[0].margin = [0, 0, 0, 20];

                    doc.styles.tableHeader.alignment = "left";
                    doc.content[1].table.widths = Array(
                      doc.content[1].table.body[0].length + 1
                    )
                      .join("*")
                      .split("");

                    doc.content[1].table.widths[
                      doc.content[1].table.body[0].length - 1
                    ] = 15;
                    doc.content[1].table.widths[
                      doc.content[1].table.body[0].length - 2
                    ] = 100;
                    doc.content[1].table.body.forEach((b) => {
                      b.reverse();
                      b.forEach((cell) => {
                        cell.alignment = "center";
                      });
                    });
                    // Group table headers (dates) by month and add a header row for each month with colspan
                    const tableBody = doc.content[1].table.body;
                    const headerRow = tableBody[0];
                    const monthMap = {};
                    const monthOrder = [];
                    headerRow.forEach((cell, idx) => {
                      if (
                        typeof cell.text === "string" &&
                        /^\d{4}-\d{2}-\d{2}$/.test(cell.text)
                      ) {
                        const [year, month] = cell.text.split("-").slice(0, 2);
                        const key = `${
                          arabicMonths[Number(month) - 1]
                        } ${year}`;
                        if (!monthMap[key]) {
                          monthMap[key] = { start: idx, count: 1 };
                          monthOrder.push(key);
                        } else {
                          monthMap[key].count++;
                        }
                        cell.text = cell.text.split("-")[2];
                      }
                    });
                    doc.content[1].table.body[0] = headerRow;

                    // Build the month header row
                    const monthHeaderRow = [];
                    let colIdx = 0;
                    monthOrder.forEach((key) => {
                      const { start, count } = monthMap[key];
                      // Fill empty cells before this month
                      while (colIdx < start) {
                        monthHeaderRow.push({});
                        colIdx++;
                      }
                      // Add the month header cell
                      monthHeaderRow.push({
                        text: key,
                        style: "tableHeader",
                        colSpan: count,
                        alignment: "center",
                      });
                      colIdx++;
                      // Fill the rest of the colspan with empty cells
                      for (let i = 1; i < count; i++) {
                        monthHeaderRow.push({});
                        colIdx++;
                      }
                    });
                    // Fill any remaining columns
                    while (monthHeaderRow.length < headerRow.length) {
                      monthHeaderRow.push({});
                    }
                    // Insert the month header row above the date header
                    tableBody.unshift(monthHeaderRow);

                    // set layout
                    doc.content[1].layout = {
                      hLineWidth: function (i, node) {
                        return i === 0 || i === node.table.body.length ? 2 : 1;
                      },
                      vLineWidth: function (i, node) {
                        return i === 0 || i === node.table.widths.length
                          ? 2
                          : 1;
                      },
                      hLineColor: function (i, node) {
                        return i === 0 || i === node.table.body.length
                          ? "black"
                          : "gray";
                      },
                      vLineColor: function (i, node) {
                        return i === 0 || i === node.table.widths.length
                          ? "black"
                          : "gray";
                      },
                    };
                  },
                },
              ],
            },
          },
        },
        false,
        true
      );
    } else {
      console.log("لاتوجد معلومات");
    }
  } catch (error) {
    console.error("Error executing query:", error);
  }
}

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

function setRequirQuantityDetailInput() {
  requirQuantityDetailInput.value = `${
    firstSurahSelect.options[firstSurahSelect.selectedIndex].text
  } - ${firstAyahSelect.options[firstAyahSelect.selectedIndex].value} إلى ${
    secondSurahSelect.options[secondSurahSelect.selectedIndex].text
  } - ${secondAyahSelect.options[secondAyahSelect.selectedIndex].value}`;
}

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
    secondSurahSelect.querySelector("option").style.pdisplay = "none";

    secondAyahSelect.disabled = true;
    secondAyahSelect.innerHTML = "";
    secondAyahSelect.appendChild(createOption("", "--  --"));
  }
};

secondSurahSelect.onchange = async function () {
  checkSecondSurahAyahs(parseInt(this.value));
  setRequirQuantityDetailInput();
};

firstAyahSelect.onchange = async function () {
  checkSecondSurahAyahs(parseInt(this.value));
  setRequirQuantityDetailInput();
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
  setRequirQuantityDetailInput();
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

function deleteTableRow(selector, columnName, columnValue) {
  const table = $(selector).DataTable();
  table.rows().every(function () {
    var rowData = this.data();
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

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

moment.updateLocale("ar_dz");
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
let workingDay = new Date().toISOString().slice(0, 10);
let workingDayID = null;
let loadingModalShowNumber = [];
let lastRequirements = {};
let isGirls = null;
let currentTime = { hours: 0, minutes: 0 };
const workingClassroomSelect = document.getElementById("workingClassroom");
const dayDateInput = $("#dayDate");
const dayNoteContainer = document.getElementById("dayNoteContainer");
const statisticsDateInput = $("#statisticsrange");
const addQuranSelectionBtn = document.getElementById("addQuranSelectionBtn");
const retardInput = document.getElementById("retard");

const requirementsTable = document.getElementById("requirementTable");
const secondAyahSelect = document.getElementById("second-ayah");
const firstAyahSelect = document.getElementById("first-ayah");
const secondSurahSelect = document.getElementById("second-surah");
const firstSurahSelect = document.getElementById("first-surah");
const requirEvaluationInput = document.getElementById("requirEvaluation");
const requireBookInput = document.getElementById("requirBook");
const saveStateErrorsInput = document.getElementById("saveStateErrors");
const requirTeacherInput = document.getElementById("requirTeacher");
let teachersPoints = {};

const studentNameInput = document.getElementById("studentName");
const clothingInput = document.getElementById("clothing");
const haircutInput = document.getElementById("haircut");
const behaviorInput = document.getElementById("behavior");
const prayerInput = document.getElementById("prayer");
const addedPointsInput = document.getElementById("addedPoints");
const evalMoyenne = document.getElementById("evalMoyenne");

const requirMoyenneInput = document.getElementById("requirMoyenne");
const historyRequirBtn = document.getElementById("historyRequirBtn");
const requirQuantityDetailInput = document.getElementById(
  "requirQuantityDetail"
);
const requirQuantityInput = document.getElementById("requirQuantity");
const requirTypeInput = document.getElementById("requirType");

const classroomIdInput = document.getElementById("classroomId");
const mosqueInput = document.getElementById("mosque");
const placeInput = document.getElementById("place");
const sexInput = document.getElementById("sex");
const levelInput = document.getElementById("level");

const studentIdInput = document.getElementById("studentId");
const firstNameInput = document.getElementById("fname");
const lastNameInput = document.getElementById("lname");
const birthyearInput = document.getElementById("birthyear");
const parentPhoneInput = document.getElementById("parentPhone");

const newStudentInfosForm = document.getElementById("newStudentInfosForm");
const newClassroomInfosForm = document.getElementById("newClassroomInfosForm");
const studentDayForm = document.getElementById("studentDayForm");
const studentDayFormSubmitBtn = document.getElementById(
  "studentDayFormSubmitBtn"
);

const newStudentDayModalBody = document.getElementById(
  "newStudentDayModalBody"
);

let statisAllCheckbox = document.getElementById("statisAllCheckbox");
const statisticType = document.getElementById("statisticType");

let start_time = null;
const themeSelector = document.getElementById("themeSelector");
const themeTag = document.getElementById("themeStylesheet");
const fontSelector = document.getElementById("fontSelect");

const loadingModalText = document.getElementById("loadingText");
const loadingModalElement = document.getElementById("loadingModal");
const loadingModal = new bootstrap.Modal(loadingModalElement);

const studentDayModalElement = document.getElementById("newStudentDayModal");
const studentDayModal = new bootstrap.Modal(studentDayModalElement);

const studentInfosModal = new bootstrap.Modal(
  document.getElementById("newStudentInfosModal")
);
const classroomInfosModal = new bootstrap.Modal(
  document.getElementById("newClassroomInfosModal")
);

const requirCollapse = new bootstrap.Collapse(
  document.getElementById("requirCollapse")
);

const evaluationCollapse = new bootstrap.Collapse(
  document.getElementById("evaluationCollapse")
);

document.getElementById("maximizeModalBtn").onclick = async (e) => {
  studentDayModal.show();
  document.getElementById("maximizeModalBtn").style.display = "none";
};

async function minimizeModal() {
  document.getElementById("maximizeModalBtn").style.removeProperty("display");
}

async function initPlusMinusButtons(numberField) {
  const minusBtn = numberField.previousElementSibling;
  const plusBtn = numberField.nextElementSibling;

  minusBtn.addEventListener("click", () => {
    let currentValue = parseInt(numberField.value);
    if (!isNaN(currentValue) && currentValue > parseInt(numberField.min)) {
      numberField.value = currentValue - parseInt(numberField.step);
      numberField.dispatchEvent(new Event("change"));
    }
  });

  plusBtn.addEventListener("click", () => {
    let currentValue = parseInt(numberField.value);
    if (!isNaN(currentValue) && currentValue < parseInt(numberField.max)) {
      numberField.value = currentValue + parseInt(numberField.step);
      numberField.dispatchEvent(new Event("change"));
    } else if (isNaN(currentValue)) {
      // Handle empty field case
      numberField.value = parseInt(numberField.min) || 0;
      numberField.dispatchEvent(new Event("change"));
    }
  });
}
// back button event listenner
try {
  if (history && typeof history.pushState === "function") {
    if (!history.state || !history.state.isPWABack) {
      history.replaceState({ isPWABack: true }, "");
    }
    history.pushState({ isPWABack: true }, "");
  }
} catch (err) {}

function on_back_function(e) {
  if (!e.state || !e.state.isPWABack) return;

  const modalIsShown =
    studentDayModalElement && studentDayModalElement.classList.contains("show");

  if (modalIsShown) {
    studentDayModal.hide();
    history.pushState({ isPWABack: true }, "");
    return;
  }
  window.addEventListener("popstate", on_back_function);
}
window.addEventListener("popstate", on_back_function);

document.addEventListener("DOMContentLoaded", async function () {
  // init Plus Minus buttons
  initPlusMinusButtons(saveStateErrorsInput);
  initPlusMinusButtons(addedPointsInput);
  initPlusMinusButtons(prayerInput);

  // theme selector
  themeSelector.onchange = async function () {
    const theme = this.value;
    themeTag.href = `https://cdnjs.cloudflare.com/ajax/libs/bootswatch/5.3.8/${theme}/bootstrap.rtl.min.css`;
    localStorage.setItem("selectedTheme", theme);

    // Optimize theme-specific style injection/removal
    const styleId = "darkThemeStyle";
    let styleNode = document.getElementById(styleId);

    if (
      themeSelector.options[themeSelector.selectedIndex].text.includes("(dark)")
    ) {
      if (!styleNode) {
        styleNode = document.createElement("style");
        styleNode.id = styleId;
        styleNode.textContent = `
        .btn, .form-select,.form-control, .input-group-text {
          padding-bottom: 5px !important;
          padding-top: 5px !important;
        }
      `;
        document.head.appendChild(styleNode);
      }
      document
        .getElementById("classroomsListTable")
        .classList.add("table-dark");
      document.getElementById("studentsListTable").classList.add("table-dark");
      document.getElementById("dayListTable").classList.add("table-dark");
      document.getElementById("statisticsTable").classList.add("table-dark");
    } else {
      if (styleNode) styleNode.remove();
      document
        .getElementById("classroomsListTable")
        .classList.remove("table-dark");
      document
        .getElementById("studentsListTable")
        .classList.remove("table-dark");
      document.getElementById("dayListTable").classList.remove("table-dark");
      document.getElementById("statisticsTable").classList.remove("table-dark");
    }
  };

  const savedTheme = localStorage.getItem("selectedTheme");
  if (savedTheme) {
    themeSelector.value = savedTheme;
    themeSelector.dispatchEvent(new Event("change"));
  }

  // font change
  fontSelector.onchange = async function () {
    const font = this.value;
    document.body.style.fontFamily = font;
    localStorage.setItem("selectedFont", font);
  };
  const savedFont = localStorage.getItem("selectedFont");
  if (savedFont) {
    fontSelector.value = savedFont;
    fontSelector.dispatchEvent(new Event("change"));
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
      if (db_key == PROJECT_DB_KEY) {
        localStorage.setItem("lastSaveAt", new Date());
        localStorage.setItem("newSaveExists", true);
      }
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
async function loadDBFromFile(file, downloaded = false) {
  const arrayBuffer = await file.arrayBuffer();
  try {
    project_db = new SQL.Database(new Uint8Array(arrayBuffer));
    await saveToIndexedDB(project_db.export());
    if (downloaded) localStorage.removeItem("newSaveExists");
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
      // display synchronization badge
      if (localStorage.getItem("newSaveExists"))
        document.querySelectorAll(".syncBadge").forEach((syncBadge) => {
          syncBadge.style.removeProperty("display");
        });
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
  localStorage.removeItem("workingClassroomId");
  window.location.reload();
}

async function googleSignin() {
  if (!navigator.onLine) {
    window.showToast("warning", "لا يوجد اتصال بالإنترنت.");
    return;
  }
  await showLoadingModal("جاري تسجيل الدخول");
  await initializeGoogleAuth(async (accessToken) => {
    if (project_db && workingClassroomId) {
      await asyncDB();
    } else {
      try {
        const downloadResult = await downloadDBfromDrive();
        if (downloadResult == null) {
          if (confirm(`لاتوجد ملفات سابقة، هل تريد إنشاء قاعدة جديدة؟`)) {
            await createNewDB();
          }
        } else if (downloadResult == false) {
          ("pass");
        } else {
          await loadDBFromFile(downloadResult, (downloaded = true));
        }
      } catch (e) {
        console.log(e.message);
        window.showToast("error", e.message);
        hideLoadingModal();
      }
    }
  });
  hideLoadingModal();
}

document.getElementById("downloadDBbtn").onclick = exportDB;
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
      if (await uploadDBtoDrive(project_db.export())) {
        window.showToast("success", "تمت المزامنة بنجاح.");
        localStorage.removeItem("newSaveExists");
        document.querySelectorAll(".syncBadge").forEach((syncBadge) => {
          syncBadge.style.display = "none";
        });
      }
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
  isGirls = this.options[this.selectedIndex].dataset.sex === "إناث";
  haircutInput.disabled = isGirls;
  statisticType.value = "0";
  statisticType.dispatchEvent(new Event("change"));
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
      window.showToast(
        `success", "تم تعديل الطالب${isGirls ? "ة" : ""} بنجاح.`
      );
    } else {
      project_db.run(
        "INSERT INTO class_rooms (mosque, place, sex, level) VALUES (?, ?, ?,?);",
        [mosque, place, sex, level]
      );
      newClassroomInfosForm.reset();
      window.showToast(
        "success",
        `تم إضافة الطالب${isGirls ? "ة" : ""} بنجاح.`
      );
    }
    saveToIndexedDB(project_db.export());
    classroomInfosModal.hide();
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
      // Cache commonly used references
      const columns = result.columns;
      const columnIndexes = {
        id: columns.indexOf("id"),
        mosque: columns.indexOf("mosque"),
        place: columns.indexOf("place"),
        sex: columns.indexOf("sex"),
        level: columns.indexOf("level"),
      };

      result.values.forEach((row) => {
        // Create button group once
        const button_group = document.createElement("div");
        button_group.className = "btn-group btn-group-sm";
        button_group.setAttribute("role", "group");
        button_group.setAttribute("aria-label", "Basic example");

        // Extract values once
        const classroomId = row[columnIndexes.id];
        const mosque = row[columnIndexes.mosque];
        const place = row[columnIndexes.place];
        const sex = row[columnIndexes.sex];
        const level = row[columnIndexes.level];

        // Edit button
        const editBtn = document.createElement("button");
        editBtn.className = "btn btn-info btn-sm";
        editBtn.innerHTML = "تعديل";
        editBtn.onclick = () => {
          classroomInfosModal.show();
          classroomIdInput.value = classroomId;
          mosqueInput.value = mosque;
          placeInput.value = place;
          sexInput.value = sex;
          levelInput.value = level;
        };
        button_group.appendChild(editBtn);

        // Delete button
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "btn btn-danger btn-sm";
        deleteBtn.innerHTML = "حذف";
        CreateOnClickUndo(deleteBtn, () => {
          if (!confirm("هل أنت متأكد أنك تريد حذف هذا القسم؟") || !project_db) {
            return;
          }
          try {
            project_db.run("DELETE FROM class_rooms WHERE id = ?;", [
              classroomId,
            ]);
            saveToIndexedDB(project_db.export());
            deleteTableRow("#classroomsListTable", "id", classroomId);
            window.showToast(
              "success",
              `تم حذف الطالب${isGirls ? "ة" : ""} بنجاح.`
            );
          } catch (e) {
            window.showToast("warning", "Error: " + e.message);
          }
        });
        button_group.appendChild(deleteBtn);

        // Add data row
        data.push({
          id: classroomId,
          mosque,
          place,
          sex,
          level,
          actions: button_group,
        });

        // Add select option
        const displayText = [place, mosque, sex, level].join(" - ");
        const option = new Option(displayText, classroomId);
        Object.assign(option.dataset, { sex });
        workingClassroomSelect.add(option);
      });
      if (workingClassroomId) {
        workingClassroomSelect.value = workingClassroomId;
        isGirls =
          workingClassroomSelect.options[workingClassroomSelect.selectedIndex]
            .dataset.sex === "إناث";
        haircutInput.disabled = isGirls;
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
        { data: "actions", className: "py-1" },
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
                text: '<i class="fa-solid fa-table-cells"></i>',
                action: async function (e, dt, button, config) {
                  const columns = dt.columns([0, 4, 5]);
                  const isVisible = dt.column(columns[0][0]).visible();

                  columns.visible(!isVisible);
                  classroomsTableDetailIsShow = !isVisible;
                  dt.button(0).text(
                    isVisible
                      ? '<i class="fa-solid fa-table-cells">'
                      : '<i class="fa-solid fa-table"></i>'
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
        action_button_group.className = "btn-group btn-group-sm";
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
          firstNameInput.value =
            result[0].values[0][result[0].columns.indexOf("fname")];
          lastNameInput.value =
            result[0].values[0][result[0].columns.indexOf("lname")];
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
          if (!confirm(`هل أنت متأكد أنك تريد حذف هذا الطالب؟`)) {
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
            window.showToast(
              "success",
              `تم حذف الطالب${isGirls ? "ة" : ""} بنجاح.`
            );
          } catch (e) {
            window.showToast("warning", "Error: " + e.message);
          }
        });
        action_button_group.appendChild(deleteBtn);

        // phone buttons
        let phone_button_group = "غير متوفر";
        if (row[result.columns.indexOf("parent_phone")]) {
          phone_button_group = document.createElement("div");
          phone_button_group.className = "btn-group btn-group-sm";
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
          select: "",
          id: row[0],
          num: data.length + 1,
          name:
            row[result.columns.indexOf("fname")] +
            " " +
            row[result.columns.indexOf("lname")],
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
        { data: "select" },
        { data: "id" },
        { data: "num" },
        { data: "name" },
        { data: "age", className: "text-center" },
        { data: "parentPhone", className: "py-1" },
        { data: "actions", className: "py-1" },
      ],
      {
        select: {
          style: "multi",
          selector: "td:first-child",
          headerCheckbox: "select-page",
        },
        destroy: true,
        order: [[2, "asc"]],
        columnDefs: [
          {
            targets: 0,
            render: DataTable.render.select(),
          },
          { visible: false, targets: [1, 6] },
          {
            targets: [0, 5, 6],
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
                text: '<i class="fa-solid fa-table-cells">',
                action: async function (e, dt) {
                  const columns = dt.columns([6]);
                  const isVisible = dt.column(columns[0][0]).visible();

                  columns.visible(!isVisible);
                  studentsTableDetailIsShow = !isVisible;
                  dt.button(0).text(
                    isVisible
                      ? '<i class="fa-solid fa-table-cells">'
                      : '<i class="fa-solid fa-table"></i>'
                  );
                },
              },
              {
                text: '<i class="fa-solid fa-comment-sms">',
                action: async function (e, dt) {
                  const selectedRows = dt
                    .rows({ selected: true })
                    .data()
                    .toArray();
                  if (selectedRows.length === 0) {
                    window.showToast("info", "الرجاء اختيار طلاب أولاً.");
                    return;
                  }
                  const phones = selectedRows
                    .map((row) => row.parentPhone)
                    .filter((row) => typeof row !== "string")
                    .map((row) =>
                      row.querySelector("a").href.replace("tel:", "")
                    )
                    .toString();

                  window.location.href = `sms:${phones}`;
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
  const fname = firstNameInput.value;
  const lname = lastNameInput.value;
  const birthyear = birthyearInput.value;
  const parentPhone = parentPhoneInput.value || null;

  if (!fname || !birthyear || !lname) {
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
        "UPDATE students SET fname = ?,lname = ?, birthyear = ?, parent_phone = ? WHERE id = ?;",
        [fname, lname, birthyear, parentPhone, studentIdInput.value]
      );
      window.showToast(
        "success",
        `تم تعديل الالطالب${isGirls ? "ة" : ""} بنجاح.`
      );
    } else {
      project_db.run(
        "INSERT INTO students (fname,lname, birthyear, parent_phone, class_room_id) VALUES (?, ?,?, ?,?);",
        [fname, lname, birthyear, parentPhone, workingClassroomId]
      );
      newStudentInfosForm.reset();
      studentIdInput.value = "";
      window.showToast(
        "success",
        `تم إضافة الالطالب${isGirls ? "ة" : ""} بنجاح.`
      );
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

  if (this.value === "القرآن الكريم") {
    quranSelectionSection.style.removeProperty("display");
    requirQuantityDetailInput.style.display = "none";
    requirQuantityInput.readOnly = true;
  } else {
    requirQuantityDetailInput.style.removeProperty("display");
    quranSelectionSection.style.display = "none";
    requirQuantityInput.readOnly = false;
  }
  requirQuantityDetailInput.value = "";
  requirEvaluationInput.value = "10.00";
  saveStateErrorsInput.value = "0";
};

function setAttendanceValue(value) {
  let radioId = null;
  switch (value) {
    case 1:
      radioId = "present";
      break;
    case 0:
      radioId = "JustifiedAbsence";
      break;
    default:
      radioId = "UnjustifiedAbsence";
  }
  const radio = document.getElementById(radioId);
  radio.checked = true;
  onChangeAttendanceState(radio);
}

function getAttendanceValue() {
  switch (document.querySelector(`input[name=attendance]:checked`).id) {
    case "present":
      return 1;
      break;
    case "JustifiedAbsence":
      return 0;
      break;
    default:
      return 2;
  }
}

function onChangeAttendanceState(radio = null) {
  const selectedRadio =
    radio || document.querySelector(`input[name=attendance]:checked`);
  if (!selectedRadio) {
    return;
  }
  if (selectedRadio.id !== "present") {
    newStudentDayModalBody.style.display = "none";
  } else {
    evalMoyenne.value = "0.00";
    newStudentDayModalBody.style.display = "block";
  }
}

function calcEvaluationMoyenne(
  retard,
  clothing,
  haircut,
  behavior,
  prayer,
  addedPoints
) {
  let moyenne = 0;
  moyenne += 30 - parseInt(retard > -1 ? retard : 0) / 3;
  moyenne += parseInt(clothing) || 0;
  moyenne += parseInt(haircut) || 0;
  moyenne += parseInt(behavior) || 0;
  moyenne += parseInt(prayer) || 0;
  moyenne += parseFloat(addedPoints) || 0;
  return moyenne.toFixed(2);
}

function calcRequirementMoyenne(quantity, evaluation, type) {
  let value = 0;
  if (type === "حفظ") {
    value = evaluation * quantity;
  } else if (type === "حصيلة") {
    value = evaluation * (quantity / 2.5);
  } else if (type === "مراجعة") {
    value = evaluation * (quantity / 2);
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
  // moyenne = moyenne / (rows.length || 1);
  return moyenne ? moyenne.toFixed(2) : "0.00";
}

function calcRequirementEvaluation(
  requirQuantity,
  requirType,
  saveStateErrors
) {
  const errorValue = parseFloat(
    10 /
      (requirQuantity *
        (requirType === "حفظ" ? 2 : requirType === "مراجعة" ? 1 : 0.8))
  );
  const result = parseFloat(10 - errorValue * parseFloat(saveStateErrors));
  return result ? (result < 0 ? 0 : result.toFixed(2)) : "";
}

function calcGlobalMoyenne(requirsMoyenne, evalMoyenne) {
  let globalEvaluation = 0;
  globalEvaluation = requirsMoyenne + evalMoyenne;
  globalEvaluation = globalEvaluation > 0 ? globalEvaluation : 0;
  return globalEvaluation.toFixed(2);
}

$([
  retardInput,
  behaviorInput,
  prayerInput,
  clothingInput,
  haircutInput,
  addedPointsInput,
]).on("change input", () => {
  studentDayFormSubmitBtn.disabled = false;
  studentDayFormSubmitBtn.nextElementSibling.disabled = false;

  evalMoyenne.value = calcEvaluationMoyenne(
    retardInput.value,
    clothingInput.value,
    haircutInput.value,
    behaviorInput.value,
    prayerInput.value,
    addedPointsInput.value
  );
});

function setRequirEvalInput() {
  requirEvaluationInput.value = calcRequirementEvaluation(
    requirQuantityInput.value,
    requirTypeInput.value,
    saveStateErrorsInput.value
  );
}

$([requirTypeInput, saveStateErrorsInput]).on(
  "change input",
  setRequirEvalInput
);

function update_student_day_notes(studentId, working_day_id) {
  if (!project_db) {
    window.showToast("info", "لا يوجد قاعدة بيانات مفتوحة.");
    return;
  }
  if ([0, 1].includes(getAttendanceValue())) {
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
          working_day_id,
          JSON.stringify(requirList),
          requirMoyenneInput.value || "0",
        ]
      );
    } else {
      project_db.run(
        `DELETE FROM day_requirements WHERE student_id = ? AND day_id = ?;`,
        [studentId, working_day_id]
      );
    }
    project_db.run(
      "INSERT OR REPLACE INTO day_evaluations (student_id, day_id, attendance,retard,clothing,haircut,behavior,prayer,added_points,moyenne) VALUES (?, ?, ?, ?,?,?,?,?,?,?);",
      [
        studentId,
        working_day_id,
        getAttendanceValue(),
        getAttendanceValue() == 1 ? retardInput.value : null,
        parseInt(clothingInput.value) || null,
        parseInt(haircutInput.value) || null,
        parseInt(behaviorInput.value) || null,
        parseInt(prayerInput.value) || null,
        parseInt(addedPointsInput.value) || null,
        getAttendanceValue() == 1 ? evalMoyenne.value : 0,
      ]
    );
  } else {
    project_db.run(
      `DELETE FROM day_evaluations WHERE student_id = ? AND day_id = ?;`,
      [studentId, working_day_id]
    );
  }

  Object.keys(teachersPoints).forEach((key) => {
    project_db.run(
      `UPDATE day_evaluations SET added_points = added_points + ? ,
                                  moyenne = moyenne + ?
                                  WHERE student_id = ?  
                                  AND day_id = ?;`,
      [teachersPoints[key], teachersPoints[key], key, working_day_id]
    );
  });
  teachersPoints = {};

  saveToIndexedDB(project_db.export());
  loadDayStudentsList();
}

function calcRetardTime() {
  let retardTime = 0;
  return moment().diff(moment(start_time, "HH:mm"), "minutes");
}

function checkAuthorizedOut(time, requirMoyenne, minutesToAdd, after = 60) {
  const now = new Date();
  const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();
  const [h, m] = time.split(":").map(Number);
  const newTimeObj = h * 60 + m + (minutesToAdd + after);
  const difference = newTimeObj - currentTotalMinutes;
  return requirMoyenne && difference < 0;
}

async function showOffCanvas(title, body, side = "top") {
  const bsOffcanvas = new bootstrap.Offcanvas("#offcanvasTop");
  document.getElementById("offcanvasTop").classList.remove(`offcanvas-top`);
  document.getElementById("offcanvasTop").classList.remove(`offcanvas-end`);
  document.getElementById("offcanvasTop").classList.remove(`offcanvas-start`);
  document.getElementById("offcanvasTop").classList.remove(`offcanvas-bottom`);
  document.getElementById("offcanvasTop").classList.add(`offcanvas-${side}`);

  document.getElementById("offcanvasTopLabel").innerText = `${title}:`;
  document.getElementById("offcanvas-body").innerHTML = body;
  bsOffcanvas.show();
}

async function markPresence(studentId) {
  const retard_time = calcRetardTime();
  project_db.run(
    "INSERT OR REPLACE INTO day_evaluations (student_id, day_id, attendance,retard,clothing,haircut,behavior,added_points,moyenne) VALUES (?,?, ?,?, ?,?,?,?,?);",
    [
      studentId,
      workingDayID,
      1,
      retard_time,
      null,
      null,
      null,
      null,
      calcEvaluationMoyenne(retard_time, null, null, null, null, null),
    ]
  );
  saveToIndexedDB(project_db.export());
  await loadDayStudentsList();
}

function showApopintmentTimePicker(initialTime = null) {
  setApointementTimeToNow();
  updateAppointmentTimeDisplay();
  new bootstrap.Modal(document.getElementById("timeModal")).show();
}

function updateAppointmentTimeDisplay() {
  const h = currentTime.hours.toString().padStart(2, "0");
  const m = currentTime.minutes.toString().padStart(2, "0");
  document.getElementById("timeDisplay").textContent = `${h}:${m}`;
}

function adjustApointementTimeMinutes(minutes) {
  currentTime.minutes = Math.floor(currentTime.minutes / 15) * 15;
  if (currentTime.minutes === 60) {
    currentTime.hours++;
    currentTime.minutes = 0;
  }
  currentTime.minutes += minutes;

  // Handle overflow/underflow
  while (currentTime.minutes >= 60) {
    currentTime.hours++;
    currentTime.minutes -= 60;
  }
  while (currentTime.minutes < 0) {
    currentTime.hours--;
    currentTime.minutes += 60;
  }

  // Wrap hours
  if (currentTime.hours < 0) currentTime.hours = 23;
  if (currentTime.hours > 23) currentTime.hours = 0;

  updateAppointmentTimeDisplay();
}

function setApointementTimeToNow() {
  const now = new Date();
  currentTime.hours = now.getHours();
  currentTime.minutes = now.getMinutes();
  updateAppointmentTimeDisplay();
}

async function addNewStudyDay() {
  if (!project_db) {
    indow.showToast("info", "لا يوجد قاعدة بيانات مفتوحة....");
    return;
  }

  const h = currentTime.hours.toString().padStart(2, "0");
  const m = currentTime.minutes.toString().padStart(2, "0");
  const appointment_time = `${h}:${m}`;
  if (appointment_time == null) {
    window.showToast("error", "يرجى اختيار وقت البدء.");
    return;
  } else if (!/^(2[0-3]|[0-1]?[\d]):[0-5][\d]$/.test(appointment_time)) {
    window.showToast("error", "يرجى اختيار وقت صحيح.");
    return;
  }
  project_db.run(
    "INSERT OR REPLACE INTO education_day (date,time, notes,class_room_id) VALUES (?,?, ?,?);",
    [workingDay, appointment_time, null, workingClassroomId]
  );
  start_time = appointment_time;
  saveToIndexedDB(project_db.export());
  setIsCustomDate();
  await loadDayStudentsList();
}

function setOptionValueByText(selector, text) {
  for (let i = 0; i < selector.options.length; i++) {
    if (selector.options[i].text === text) {
      selector.selectedIndex = i;
      selector.dispatchEvent(new Event("change"));
      return; // Exit the loop once the option is found and selected
    }
  }
}

function initRequirementFields(student_idORdetail) {
  let detail = null;

  if (typeof student_idORdetail === "object") {
    detail = student_idORdetail;
  } else {
    const lsR = project_db.exec(`
            SELECT dr.detail
            FROM day_requirements dr
            INNER JOIN education_day ed ON dr.day_id = ed.id
            WHERE dr.student_id = ${student_idORdetail}
            ORDER BY ed.date DESC
            LIMIT 1;`);
    if (lsR.length) detail = JSON.parse(lsR[0].values[0][0]).at(-1);
  }

  if (detail) {
    requireBookInput.value = detail["الكتاب"];
    requireBookInput.dispatchEvent(new Event("change"));
    const Type = detail["النوع"];
    const startSurahName = detail["التفاصيل"].split(" ").at(0);
    const finishSurahName = detail["التفاصيل"].split(" ").at(-3);
    if (detail["الكتاب"] == "القرآن الكريم") {
      setOptionValueByText(firstSurahSelect, finishSurahName);
      firstAyahSelect.value =
        parseInt(detail["التفاصيل"].split(" ").at(-1)) + 1;
      if (!firstAyahSelect.value) {
        if (Type == "حفظ") {
          requirTypeInput.value = "حصيلة";
          firstAyahSelect.value = "1";
        } else {
          requirTypeInput.value = Type == "حصيلة" ? "حفظ" : "مراجعة";
          if (Type == "مراجعة" && startSurahName !== finishSurahName) {
            setOptionValueByText(firstSurahSelect, startSurahName);
          }
          firstSurahSelect.value =
            firstSurahSelect.options[firstSurahSelect.selectedIndex - 1].value;
          firstSurahSelect.dispatchEvent(new Event("change"));
        }
      } else {
        requirTypeInput.value = Type;
      }
      firstAyahSelect.dispatchEvent(new Event("change"));
    }
  } else {
    requireBookInput.dispatchEvent(new Event("change"));
  }
  requirTeacherInput.value = "0";
}

async function showStudentDayModal(isUniqueStudent = true) {
  studentDayModal.show();
  studentDayFormSubmitBtn.disabled = true;
  studentDayFormSubmitBtn.nextElementSibling.disabled = true;

  newStudentDayModalBody.style.display = "block";
  if (isUniqueStudent) {
    document
      .getElementById("present")
      .parentElement.style.removeProperty("display");
  } else {
    evaluationCollapse.show();
    document.getElementById("present").parentElement.style.display = "none";
  }
  document.getElementById("requirCollapse").parentElement.style.display =
    isUniqueStudent ? "block" : "none";
  evalMoyenne.disabled = !isUniqueStudent;
  retardInput.disabled = !isUniqueStudent;
}

function showRequirementsHistory(student_id) {
  let requirs = [];
  project_db
    .exec(
      ` SELECT detail FROM day_requirements
                  WHERE student_id = ${student_id} ORDER BY day_id DESC
                  LIMIT 3`
    )[0]
    .values.forEach((row) => {
      requirs.push(row[0]);
    });
  showOffCanvas(
    "المتطلبات السابقة",
    `
              <ul> ${requirs
                .map((item) =>
                  JSON.parse(item)
                    .map(
                      (i) =>
                        `<li> ${i["النوع"]} - ${i["التفاصيل"]} - الأخطاء: ${
                          i["الأخطاء"] || 0
                        }</li>`
                    )
                    .join("")
                )
                .reverse()
                .join("")}</ul>
              `,
    "start"
  );
}

async function loadDayStudentsList() {
  dayNoteContainer.style.display = "none";
  if (!project_db) {
    window.showToast("info", "لا توجد قاعدة بيانات مفتوحة....");
    return;
  }

  const dayResult = project_db.exec(
    `SELECT * FROM education_day WHERE class_room_id = ? AND date = ?`,
    [workingClassroomId, workingDay]
  );
  if (!dayResult.length) {
    if ($.fn.DataTable.isDataTable("#dayListTable")) {
      $("#dayListTable").DataTable().destroy();
    }
    document.getElementById("addNewDayBtn").style.display = "block";
    document.getElementById("dayListTable").style.display = "none";
    return;
  }

  workingDayID = dayResult[0].values[0][dayResult[0].columns.indexOf("id")];
  start_time =
    dayResult[0].values[0][dayResult[0].columns.indexOf("time")] || null;

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
          s.fname AS studentFName,
          s.lname AS studentLName,
          s.parent_phone AS parentPhone,
          dr.detail AS "detail",
          dr.moyenne AS "requirsMoyenne",
          de.attendance AS "attendance",
          de.retard AS "retard",
          de.clothing AS "clothing", 
          de.haircut AS "haircut",
          de.behavior AS "behavior",
          de.prayer AS "prayer",
          de.added_points AS "added_points",
          de.moyenne AS "evalMoyenne"
      FROM students s
      LEFT JOIN day_requirements dr ON s.id = dr.student_id AND dr.day_id = '${workingDayID}'
      LEFT JOIN day_evaluations de ON s.id = de.student_id AND de.day_id = '${workingDayID}'
      WHERE s.class_room_id = ${workingClassroomId}
      GROUP BY s.id, studentFName , studentLName
      ORDER BY s.id
      LIMIT 100`);

    const data = [];
    requirTeacherInput.options.length = 0;
    requirTeacherInput.add(new Option("المعلم", "0", (selected = true)));
    if (results.length) {
      const result = results[0];
      result.values.forEach((row) => {
        const student_id = row[result.columns.indexOf("studentId")];
        const attendance = row[result.columns.indexOf("attendance")];
        const retardValue = row[result.columns.indexOf("retard")];
        const full_name =
          row[result.columns.indexOf("studentFName")] +
          " " +
          row[result.columns.indexOf("studentLName")];

        // fill teacher options
        if (
          attendance == "1" &&
          !Array.from(requirTeacherInput.options)
            .map((option) => option.value)
            .includes(student_id)
        ) {
          requirTeacherInput.add(new Option(full_name, student_id));
        }
        function editStudentDay(isEvaluation = true) {
          showStudentDayModal(true);

          studentNameInput.value = full_name;

          if (isEvaluation) {
            evaluationCollapse.show();
            requirCollapse.hide();
          } else {
            evaluationCollapse.hide();
            requirCollapse.show();
          }

          setAttendanceValue(attendance);
          retardInput.value =
            retardValue !== null ? retardValue : calcRetardTime();
          clothingInput.value = row[result.columns.indexOf("clothing")] || "0";
          haircutInput.value = row[result.columns.indexOf("haircut")] || "0";
          behaviorInput.value = row[result.columns.indexOf("behavior")] || "0";
          prayerInput.value = row[result.columns.indexOf("prayer")] || "0";
          addedPointsInput.value =
            row[result.columns.indexOf("added_points")] || "0";
          evalMoyenne.value =
            row[result.columns.indexOf("evalMoyenne")]?.toFixed(2) ||
            calcEvaluationMoyenne(
              retardInput.value,
              clothingInput.value,
              haircutInput.value,
              behaviorInput.value,
              prayerInput.value,
              addedPointsInput.value
            );

          initRequirementFields(student_id);
          historyRequirBtn.onclick = () => showRequirementsHistory(student_id);

          requirMoyenneInput.value =
            row[result.columns.indexOf("requirsMoyenne")] || "0.00";
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
                <td>${item["الأخطاء"] || ""}</td>
                <td>${item["المعدل"]}</td>
                <td>${item["المعرض"] || ""}</td>
                <td><button class="btn btn-danger btn-sm" onclick="removeRequirItem(this)">X</button></td>`;
              requirementsTable.querySelector("tbody").appendChild(row);
            }
          );

          const working_day_id = workingDayID;
          studentDayFormSubmitBtn.onclick = async function () {
            if (!project_db) {
              window.showToast("info", "لا يوجد قاعدة بيانات مفتوحة.");
              return;
            }
            update_student_day_notes(student_id, working_day_id);
            this.disabled = true;
            this.nextElementSibling.disabled = true;
          };
        }
        // edit button
        const editBtn = document.createElement("i");
        editBtn.className = "fa-solid fa-square-plus";
        editBtn.style.cssText = "transform: scale(1.5); cursor: pointer;";
        editBtn.onclick = () => editStudentDay(false);

        const attendance_value = attendance;

        let evaluationDayContainer = "/";
        if (attendance_value) {
          evaluationDayContainer = document.createElement("div");
          const evaluationDayIcon = document.createElement("i");
          evaluationDayIcon.className = "fa-solid fa-pen-to-square";
          evaluationDayIcon.onclick = () => editStudentDay(true);
          if (
            row[result.columns.indexOf("clothing")] == null &&
            row[result.columns.indexOf("haircut")] == null &&
            row[result.columns.indexOf("behavior")] == null
          ) {
            evaluationDayIcon.textContent =
              "   " + row[result.columns.indexOf("evalMoyenne")];
          } else {
            evaluationDayContainer.append(
              row[result.columns.indexOf("evalMoyenne")] + "   "
            );
          }
          evaluationDayContainer.append(evaluationDayIcon);
        }

        let requirmentsDayValue = "/";
        if (attendance_value) {
          requirmentsDayValue = `${
            row[result.columns.indexOf("requirsMoyenne")] || "0.00"
          }    <i onclick="showRequirementsHistory(${student_id})" class="fa-solid fa-clock-rotate-left"></i>`;
        }

        const thisDay = new Date().toISOString().slice(0, 10);
        data.push({
          select: "",
          id: student_id,
          student: full_name,
          attendance:
            attendance_value == 1
              ? (retardValue < 0
                  ? `قبل ${retardValue * -1} د `
                  : retardValue == 0
                  ? `في الوقت `
                  : `بعد ${retardValue} د `) +
                (thisDay == workingDay &&
                checkAuthorizedOut(
                  start_time,
                  row[result.columns.indexOf("requirsMoyenne")],
                  retardValue
                )
                  ? "🟢"
                  : "")
              : attendance_value == 0
              ? "غياب مبرر"
              : `<button onclick="markPresence(${student_id})" class="btn fa-solid fa-square-check px-1" style="transform: scale(1.3); cursor: pointer;"></button>` +
                (row[result.columns.indexOf("parentPhone")]
                  ? `<input type="checkbox" id="sms_btn${student_id}" onclick="window.location.href='sms:${
                      row[result.columns.indexOf("parentPhone")]
                    }?body=ليكن في علمكم أن إبن${isGirls ? "ت" : ""}كم ${
                      row[result.columns.indexOf("studentFName")]
                    } غائب${
                      isGirls ? "ة" : ""
                    } عن حصة تحفيظ القرآن اليوم'" class="btn-check" autocomplete="off">
              <label class="btn fa-solid fa-comment-sms px-2" for="sms_btn${student_id}"></label>`
                  : ""),
          evaluation: attendance_value
            ? calcGlobalMoyenne(
                row[result.columns.indexOf("requirsMoyenne")],
                row[result.columns.indexOf("evalMoyenne")]
              )
            : null,
          evalMoyenne:  evaluationDayContainer,
          requirsMoyenne: requirmentsDayValue,
          actions: editBtn,
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
        { data: "select" },
        { data: "id", visible: false },
        { data: "student" },
        {
          data: "attendance",
          className: "text-start",
          type: "num",
          render: function (data, type, row) {
            if (type === "sort") {
              const data1 = data.replace("🟢", "");
              if (data1.includes("في الوقت")) return 0;
              else if (data1.includes("بعد")) {
                return parseInt(data1.replace("بعد", "").replace("د", ""));
              } else if (data1.includes("قبل")) {
                return parseInt(data1.replace("قبل", "").replace("د", "")) * -1;
              } else if (data1.includes("غياب مبرر")) {
                return "";
              } else {
                return null;
              }
            }
            return data;
          },
        },
        {
          data: "evaluation",
          className: "text-center fw-bold fs-6",
          type: "num",
          defaultContent: "/",
          render: function (data, type, row) {
            if (type === "sort" && !data) {
              return 0;
            }
            return data;
          },
        },
        {
          data: "evalMoyenne",
          className: "text-center",
          type: "num",
          defaultContent: "/",
          render: function (data, type, row) {
            if (type === "sort") {
              if (!data) return 0;
              else return parseFloat(data.innerHTML.split("  ")[0]);
            }
            return data;
          },
        },
        {
          data: "requirsMoyenne",
          className: "text-center",
          type: "num",
          defaultContent: "/",
          render: function (data, type, row) {
            if (type === "sort") {
              if (!data) return 0;
              else return parseFloat(data.split("    ")[0]);
            }
            return data;
          },
        },
        { data: "actions" },
      ],
      {
        select: {
          style: "multi",
          selector: "td:first-child",
          headerCheckbox: "select-page",
        },
        fixedHeader: true,
        destroy: true,
        searching: false,
        scrollX: true,
        info: false,
        oLanguage: {
          sSearch: "بحث",
          emptyTable: "لا توجد بيانات في الجدول.",
        },
        fixedColumns: {
          start: 0,
          end: 1,
        },
        paging: false,
        responsive: true,
        order: [[1, "asc"]],
        columnDefs: [
          {
            targets: 0,
            render: DataTable.render.select(),
          },
          // { visible: false, targets: [-3, -2] },
          { targets: [0, 1, -1], orderable: false },
        ],
        layout: {
          topStart: {
            buttons: [
              {
                extend: "colvis",
                text: '<i class="fa-solid fa-table"></i>',
              },
              {
                text: '<i class="fa-solid fa-pen-to-square"></i>',
                action: async function (e, dt) {
                  const selectedRows = dt
                    .rows({ selected: true })
                    .data()
                    .toArray();

                  if (selectedRows.length === 0) {
                    window.showToast("info", "الرجاء اختيار تلاميذ.");
                    return;
                  }
                  for (let selectedRow of selectedRows) {
                    if (selectedRow.attendance.includes("markPresence(")) {
                      window.showToast("info", "الرجاء اختيار تلاميذ حاضرين.");
                      return;
                    }
                  }

                  showStudentDayModal(false);

                  studentNameInput.value = `${selectedRows.length} طالب${
                    isGirls ? "ة" : ""
                  }`;

                  clothingInput.value = "0";
                  haircutInput.value = "0";
                  behaviorInput.value = "0";
                  prayerInput.value = "0";
                  addedPointsInput.value = "0";

                  const working_day_id = workingDayID;
                  studentDayFormSubmitBtn.onclick = async function () {
                    if (!project_db) {
                      window.showToast("info", "لا يوجد قاعدة بيانات مفتوحة.");
                      return;
                    }
                    selectedRows.forEach((selectedRow) => {
                      if (!project_db) {
                        window.showToast(
                          "info",
                          "لا يوجد قاعدة بيانات مفتوحة."
                        );
                        return;
                      }

                      // Build UPDATE query dynamically
                      const updates = [];
                      const values = {
                        clothing: parseInt(clothingInput.value) || 0,
                        haircut: parseInt(haircutInput.value) || 0,
                        behavior: parseInt(behaviorInput.value) || 0,
                        prayer: parseInt(prayerInput.value) || 0,
                        added_points: parseFloat(addedPointsInput.value) || 0,
                      };

                      // Add non-zero values to update array
                      if (values.clothing)
                        updates.push(`clothing = ${values.clothing}`);
                      if (values.haircut)
                        updates.push(`haircut = ${values.haircut}`);
                      if (values.behavior)
                        updates.push(`behavior = ${values.behavior}`);
                      if (values.prayer)
                        updates.push(
                          `prayer = COALESCE(prayer,0) + ${values.prayer}`
                        );
                      if (values.added_points)
                        updates.push(
                          `added_points = COALESCE(added_points,0) + ${values.added_points}`
                        );

                      // Calculate total moyenne adjustment
                      const moyenneAdjustment = (
                        values.clothing +
                        values.haircut +
                        values.behavior +
                        values.prayer +
                        values.added_points
                      ).toFixed(2);

                      // Add moyenne update
                      updates.push(`moyenne = moyenne + ${moyenneAdjustment}`);

                      // Execute update if there are changes
                      if (updates.length) {
                        project_db.run(`
                          UPDATE day_evaluations 
                          SET ${updates.join(", ")}
                          WHERE student_id = ${selectedRow.id} 
                          AND day_id = ${working_day_id}
                        `);
                      }
                    });
                    saveToIndexedDB(project_db.export());
                    loadDayStudentsList();
                    studentDayModal.hide();
                  };
                },
              },
              {
                text: '<i class="fa-solid fa-arrows-rotate"></i>',
                action: async function () {
                  await loadDayStudentsList();
                },
              },
              {
                extend: "collection",
                text: "المزيد",
                buttons: [
                  {
                    text: '<i class="fa-regular fa-comment"></i> ملاحظة اليوم',
                    action: async function () {
                      let note = prompt("أكتب ملاحظة:", dayNote);
                      if (note !== null) {
                        if (!project_db) {
                          window.showToast(
                            "info",
                            "لا يوجد قاعدة بيانات مفتوحة."
                          );
                          return;
                        }
                        try {
                          project_db.run(
                            "UPDATE education_day SET notes = ? WHERE id = ?;",
                            [note, workingDayID]
                          );
                          saveToIndexedDB(project_db.export());
                          dayNoteContainer.style.display = note
                            ? "block"
                            : "none";
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
                    text: '<i class="fa-solid fa-circle-info"></i> معلومات الحصة',
                    action: async function (e, dt) {
                      showOffCanvas(
                        "معلومات الحصة",
                        `
                      <p>وقت بدء الحصة: <strong>${
                        start_time || "غير محدد"
                      }</strong><br>
                      عدد التلاميذ الحاضرين: <strong>${
                        project_db.exec(
                          `SELECT COUNT(*) FROM day_evaluations WHERE day_id = ${workingDayID} AND attendance = 1;`
                        )[0].values[0][0]
                      }</strong><br>
                       ملاحظة اليوم: <em>${dayNote || "لا توجد ملاحظة"}</em><br>
                      </p>
                      `
                      );
                    },
                  },
                  {
                    text: "❌ إلغاء اليوم",
                    action: async function () {
                      if (confirm("هل تريد إلغاء هذا اليوم ؟")) {
                        project_db.run(
                          `DELETE FROM day_evaluations WHERE day_id = ?;`,
                          [workingDayID]
                        );
                        project_db.run(
                          `DELETE FROM day_requirements WHERE day_id = ?;`,
                          [workingDayID]
                        );
                        project_db.run(
                          "DELETE FROM education_day WHERE id = ?;",
                          [workingDayID]
                        );
                        saveToIndexedDB(project_db.export());
                        setIsCustomDate();
                        loadDayStudentsList();
                      }
                    },
                  },
                ],
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

async function changeDayDate(date) {
  if (date == new Date().toISOString().slice(0, 10)) {
    document
      .getElementsByClassName("date-icon")[0]
      .style.removeProperty("color");
  } else {
    document.getElementsByClassName("date-icon")[0].style.color = "#00ff4c";
  }
  workingDay = date;
  dayDateInput.val(workingDay);
  dayDateInput.data("daterangepicker").setStartDate(workingDay);
  dayDateInput.data("daterangepicker").setEndDate(workingDay);
  await loadDayStudentsList();
}

async function dayDatePickerInit() {
  // day date picker
  dayDateInput.daterangepicker(
    {
      singleDatePicker: true,
      showDropdowns: true,
      autoUpdateInput: true,
      locale: {
        format: "YYYY-MM-DD",
        daysOfWeek: arabicDays,
        monthNames: arabicMonths,
        firstDay: 6,
        applyLabel: "تأكيد",
        cancelLabel: "إلغاء",
        customRangeLabel: "تخصيص",
      },
      maxDate: workingDay,
    },
    async function (start) {
      changeDayDate(start.format("YYYY-MM-DD"));
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
        firstDay: 6,
        applyLabel: "تأكيد",
        cancelLabel: "إلغاء",
        customRangeLabel: "تخصيص",
      },
      maxDate: workingDay,
      ranges: {
        اليوم: [moment(), moment()],
        أمس: [moment().subtract(1, "days"), moment().subtract(1, "days")],
        "الأسبوع الحالي": [
          moment()
            .day(6)
            .subtract(moment().day() < 6 ? 7 : 0, "days"),
          moment()
            .day(6)
            .subtract(moment().day() < 6 ? 7 : 0, "days")
            .add(6, "days"),
        ],
        "الأسبوع الماضي": [
          moment()
            .day(6)
            .subtract(moment().day() < 6 ? 14 : 7, "days"),
          moment()
            .day(6)
            .subtract(moment().day() < 6 ? 14 : 7, "days")
            .add(6, "days"),
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
  row.remove();
  requirMoyenneInput.value = calcRequirementsMoyenne();
  studentDayFormSubmitBtn.disabled = false;
  studentDayFormSubmitBtn.nextElementSibling.disabled = false;
}

addQuranSelectionBtn.onclick = function () {
  if (
    !requireBookInput.value ||
    !requirQuantityDetailInput.value ||
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
    <td>
      ${saveStateErrorsInput.value}
    </td>
    <td>
      ${calcRequirementMoyenne(
        requirQuantityInput.value,
        requirEvaluationInput.value,
        requirTypeInput.value
      )}
    </td>
    <td>
      ${requirTeacherInput.options[requirTeacherInput.selectedIndex].text}
    </td>
    <td>
      <button class="btn btn-danger btn-sm" 
      onclick="teachersPoints[requirTeacherInput.value] = teachersPoints[requirTeacherInput.value] -
                Math.floor(parseFloat(this.parentNode.previousElementSibling.previousElementSibling.previousElementSibling.previousElementSibling.previousElementSibling.previousElementSibling.previousElementSibling.textContent));
                removeRequirItem(this);"
              >X</button>
    </td>`;
  requirementsTable.querySelector("tbody").appendChild(row);
  if (requirTeacherInput.value !== "0") {
    teachersPoints[requirTeacherInput.value] =
      (teachersPoints[requirTeacherInput.value] || 0) +
      Math.floor(parseFloat(requirQuantityInput.value));
  }

  requirMoyenneInput.value = calcRequirementsMoyenne();
  studentDayFormSubmitBtn.disabled = false;
  studentDayFormSubmitBtn.nextElementSibling.disabled = false;
  initRequirementFields({
    الكتاب: requireBookInput.value,
    النوع: requirTypeInput.value,
    التفاصيل: requirQuantityDetailInput.value,
  });
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
    if (loginStatus.innerHTML.includes("progress-bar")) initAuth();
  } else if (workingClassroomId) {
    if (tabId === "pills-students") {
      await loadStudentsList();
      newStudentInfosForm.reset();
      studentIdInput.value = "";
    } else if (tabId === "pills-new_day") {
      changeDayDate(workingDay);
      studentDayModal.hide();
    } else if (tabId === "pills-statistics") {
      fillStatistiscStudentsList();
      // showStudentsBulletins([
      //   "2025-12-01",
      //   "2025-12-02",
      //   "2025-12-12",
      //   "2025-12-13",
      //   "2025-12-15",
      //   "2025-12-16",
      //   "2025-12-17",
      //   "2025-12-19",
      //   "2025-12-20",
      //   "2025-12-21",
      //   "2025-12-22",
      //   "2025-12-23",
      //   "2025-12-27",
      //   "2025-12-28",
      // ]);
    }
  } else {
    showTab("pills-home");
    window.showToast("warning", "الرجاء إختيار قسم.");
  }
}

async function fillStatistiscStudentsList() {
  if (!project_db) {
    window.showToast("info", "لا يوجد قاعدة بيانات مفتوحة.");
    return;
  }
  try {
    const results = project_db.exec(
      "SELECT id,fname,lname FROM students WHERE class_room_id = ?;",
      [workingClassroomId]
    );
    const data = [];
    if (results.length) {
      const result = results[0];
      const dropdown = document.querySelector(".statisticsStudentsMenu");
      dropdown.innerHTML = `
        <div class="form-check">
            <input class="form-check-input" type="checkbox" id="statisAllCheckbox" onchange="statisStudentToggleAll()" checked>
            <label class="form-check-label">الجميع</label>
        </div>
        <hr>`;
      statisAllCheckbox = document.getElementById("statisAllCheckbox");
      result.values.forEach((row) => {
        const newItem = document.createElement("div");
        newItem.className = "form-check";
        newItem.innerHTML = `
                      <input class="form-check-input statisStudentItem" type="checkbox" value="${
                        row[0]
                      }" checked onchange="statisStudentUpdateAll()">
                      <label class="form-check-label">${
                        row[result.columns.indexOf("fname")] +
                        " " +
                        row[result.columns.indexOf("lname")]
                      }</label>
                  `;
        dropdown.append(newItem);
      });
    }
  } catch (e) {
    window.showToast("warning", "Error: " + e.message);
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

    return [
      result[0].values
        .map((row) => row[0])
        .filter((dateStr) => {
          const currentDate = new Date(dateStr);
          return currentDate >= startDate && currentDate <= endDate;
        }),
      startDate.getMonth() == endDate.getMonth() &&
        startDate.getFullYear() == endDate.getFullYear() &&
        startDate.getDate() == 1 &&
        endDate.getDate() ==
          new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0).getDate(),
    ];
  }
  return [[], null];
}

statisticType.onchange = async function () {
  switch (this.value) {
    case "attendance":
      await showLoadingModal("جاري تحميل الإحصائيات");
      showAttendanceStatistics();
      hideLoadingModal();
      break;
    case "results":
      await showLoadingModal("جاري تحميل الإحصائيات");
      showStudentsResultsStatistics();
      hideLoadingModal();
      break;
    default:
      if ($.fn.DataTable.isDataTable("#statisticsTable")) {
        $("#statisticsTable").DataTable().destroy();
        $("#statisticsTable").empty();
      }
  }
};

// statistics students list
function statisStudentToggleAll() {
  document.querySelectorAll(".statisStudentItem").forEach((item) => {
    item.checked = statisAllCheckbox.checked;
  });
}

function statisStudentUpdateAll() {
  const items = document.querySelectorAll(".statisStudentItem");
  const allChecked =
    items.length ===
    document.querySelectorAll(".statisStudentItem:checked").length;
  statisAllCheckbox.checked = allChecked;
}

function getStatisticsSelectedStudentsId() {
  const selected = Array.from(
    document.querySelectorAll(".statisStudentItem:checked")
  ).map((item) => item.value);
  return selected.join(", ");
}

async function showStudentsBulletins(dates) {
  try {
    const attendanceRes = {};
    project_db
      .exec(
        `
      WITH ${dates
        .map(
          (date, index) =>
            `day_id${index} AS ( SELECT id FROM education_day WHERE date = '${date}' )`
        )
        .join(",\n")}
      SELECT
          s.id,
          -- مجموع الحضور (Total Present Days Count)
          (${dates
            .map(
              (_, index) =>
                `CASE WHEN de${index}.attendance = 0 THEN 1 ELSE 0 END`
            )
            .join(" +\n        ")}) as "المجموع (/${dates.length})"
      FROM students s
      ${dates
        .map(
          (date, index) =>
            `LEFT JOIN day_evaluations de${index} ON s.id = de${index}.student_id AND de${index}.day_id IN (SELECT id FROM day_id${index})`
        )
        .join("\n")}
      WHERE s.id in (${getStatisticsSelectedStudentsId()})
      GROUP BY s.id
      ORDER BY s.id;`
      )[0]
      .values.forEach((row) => {
        const studentId = row[0];
        const totalPresent = row[1];
        attendanceRes[studentId] = dates.length - totalPresent;
      });

    // Get all student IDs from the table
    const dateCtes = dates
      .map(
        (date, index) =>
          `day_id${index} AS ( SELECT id FROM education_day WHERE date = '${date}' )`
      )
      .join(", \n");

    // Generate sum expressions for المجموع
    const sumExpressions = dates
      .map(
        (date, index) =>
          `(SELECT COALESCE(SUM(de.moyenne), 0) FROM day_evaluations de 
          WHERE de.student_id = s.id AND de.day_id IN (SELECT id FROM day_id${index}))
          + 
          (SELECT COALESCE(SUM(dr.moyenne), 0) FROM day_requirements dr 
          WHERE dr.student_id = s.id AND dr.day_id IN (SELECT id FROM day_id${index}))
        `
      )
      .join(" +\n        ");

    const results = project_db.exec(`
      WITH ${dateCtes}
      SELECT 
      s.id, s.fname, s.lname,
          -- المجموع (sum)
          COALESCE( ROUND(
              (${sumExpressions})
          , 2), 0 )  as "المجموع"
      FROM students s 
      LEFT JOIN day_evaluations de ON s.id = de.student_id 
      LEFT JOIN day_requirements dr ON dr.student_id = s.id 
      WHERE s.id in (${getStatisticsSelectedStudentsId()})
      GROUP BY s.id, s.fname, s.lname
      ORDER BY fname, lname;
      `);

    if (!results.length || !results[0].values.length) {
      window.showToast("warning", "لا يوجد طلاب في هذا القسم.");
      return;
    }

    let students = results[0].values.map((row) => ({
      id: row[0],
      name: `${row[1]} ${row[2]}`,
      order: (row[3] / attendanceRes[row[0]]).toFixed(2),
    }));

    students = [...students]
      .sort((a, b) => parseFloat(b.order) - parseFloat(a.order))
      .reduce((acc, item, index, arr) => {
        const rank =
          index === 0 ||
          parseFloat(item.order) !== parseFloat(arr[index - 1].order)
            ? index + 1
            : acc[acc.length - 1].order;
        acc.push({ ...item, order: rank.toString() });
        return acc;
      }, []);

    // Collect data for all students
    const allStudentData = [];
    for (const student of students) {
      const studentData = await getStudentData(student.id, dates);
      if (studentData.length > 0) {
        allStudentData.push({
          studentId: student.id,
          studentName: student.name,
          studentOrder: student.order,
          data: studentData,
        });
      }
    }

    if (allStudentData.length === 0) {
      window.showToast("warning", "لا توجد بيانات للطلاب في هذه الفترة.");
      return;
    }

    // Create single PDF with all students
    createMultiStudentPDF(allStudentData, dates);
  } catch (error) {
    console.error("Error generating PDF:", error);
    window.showToast("warning", "حدث خطأ في إنشاء التقرير");
  }

  // Get data for a single student
  async function getStudentData(studentId, dates) {
    const dateList = dates.map((date) => `'${date}'`).join(", ");

    const query = `
        SELECT 
            ed.date as day,
            s.fname || ' ' || s.lname as student_name,
            dr.detail,
            de.prayer,
            de.haircut,
            de.behavior,
            de.clothing,
            de.retard,
            de.attendance,
            de.added_points,
            dr.moyenne as requirements_score,
            de.moyenne as evaluation_score
        FROM education_day ed
        LEFT JOIN day_requirements dr ON ed.id = dr.day_id AND dr.student_id = ${studentId}
        LEFT JOIN day_evaluations de ON ed.id = de.day_id AND de.student_id = ${studentId}
        LEFT JOIN students s ON s.id = ${studentId}
        WHERE ed.date IN (${dateList})
        AND ed.class_room_id = ${workingClassroomId}
        ORDER BY ed.date
    `;

    const results = project_db.exec(query);
    if (!results.length) return [];

    const result = results[0];
    const columns = result.columns;
    const values = result.values;

    return values.map((row) => {
      const obj = {};
      columns.forEach((col, index) => {
        obj[col] = row[index];
      });
      return obj;
    });
  }

  // Create multi-student PDF with one student per page
  function createMultiStudentPDF(allStudentData, dates) {
    const A4_WIDTH = 595.28;
    const A4_HEIGHT = 841.89;

    const content = [];

    // First, collect all student data lengths and create pairs
    const studentPages = createStudentPagesWithPairs(allStudentData);

    // Create content for each page
    studentPages.forEach((pageStudents, pageIndex) => {
      if (pageIndex > 0) {
        content.push({ text: "", pageBreak: "before" });
      }

      // Create stacked students (one under another)
      const pageContent = [];
      pageStudents.forEach((studentReport, studentIndex) => {
        if (studentIndex > 0) {
          // Add separator between students (except for the first one)
          content.push({
            text: "ـــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــ",
            absolutePosition: {
              y: 841.89 / 2,
            },
            alignment: "center",
          });
        }

        // Add student content
        if (studentReport) {
          pageContent.push(
            ...createStudentContent(
              studentReport,
              dates,
              studentIndex > 0,
              pageStudents.length > 1
            )
          );
        }
      });

      content.push(...pageContent);
    });

    const docDefinition = {
      pageSize: "A4",
      pageMargins: [20, 20, 20, 20],
      pageOrientation: "portrait",
      content: content,
      styles: {
        header: {
          fontSize: 14,
          bold: true,
          color: "#2c3e50",
        },
        subheader: {
          fontSize: 10,
          bold: true,
          color: "#34495e",
          margin: [0, 2, 0, 2],
        },
        tableHeader: {
          fontSize: 8,
          bold: true,
          color: "#2c3e50",
          fillColor: "#ecf0f1",
        },
        tableCell: {
          fontSize: 8,
          lineHeight: 1.1,
        },
        summary: {
          fontSize: 9,
          bold: true,
          margin: [0, 8, 0, 4],
          color: "#2c3e50",
        },
      },
      defaultStyle: {
        alignment: "right",
      },
    };

    pdfMake.createPdf(docDefinition).open();
  }

  // Create student pages by first collecting all data lengths and pairing students with <10 records
  function createStudentPagesWithPairs(allStudentData) {
    // Create arrays for students with less than 10 records and those with 10 or more
    const studentsWithFewRecords = [];
    const studentsWithManyRecords = [];

    // First pass: categorize all students by their data length
    allStudentData.forEach((studentReport) => {
      const studentDataRecordsLength = studentReport.data
        .map((i) => JSON.parse(i.detail)?.length ?? 1)
        .reduce((accumulator, currentValue) => accumulator + currentValue, 0);

      if (studentDataRecordsLength <= 22) {
        studentsWithFewRecords.push(studentReport);
      } else {
        studentsWithManyRecords.push(studentReport);
      }
    });

    const pages = [];

    // Pair students with few records (2 per page)
    for (let i = 0; i < studentsWithFewRecords.length; i += 2) {
      if (i + 1 < studentsWithFewRecords.length) {
        // Pair two students on one page
        pages.push([studentsWithFewRecords[i], studentsWithFewRecords[i + 1]]);
      } else {
        // Last student with few records (odd number)
        pages.push([studentsWithFewRecords[i], null]);
      }
    }

    // Add students with many records (1 per page)
    studentsWithManyRecords.forEach((studentReport) => {
      pages.push([studentReport]);
    });

    return pages;
  }

  // Create student content (reusable for both single and stacked layouts)
  function createStudentContent(
    studentReport,
    dates,
    isSecond,
    isStacked = false
  ) {
    const { data, studentName, studentOrder, studentId } = studentReport;
    const dataLength = data
      .map((i) => {
        return i.detail ? JSON.parse(i.detail).length : 1;
      })
      .reduce((accumulator, current) => accumulator + current, 0);

    const recordCounts =
      data
        .map((i) => {
          if (Array.isArray(i.detail)) {
            return i.detail.length;
          } else {
            return 1;
          }
        })
        .reduce((accumulator, currentValue) => accumulator + currentValue, 0) +
      1;
    const tableCellHeight = isStacked ? 5 : 35 - recordCounts;
    const tableBody = createTableBody(data, tableCellHeight / 3, isStacked);

    const content = [
      // Student header
      {
        text: reverseArabicWords("تقرير  متابعة الطالب" + (isGirls ? "ة" : "")),
        style: "header",
        alignment: "center",
        fontSize: isStacked ? 12 : 14,
        absolutePosition: {
          y: (isSecond ? 841.89 / 2 : 0) + 20,
        },
      },
      {
        text: reverseArabicWords(`الطالب${isGirls ? "ة" : ""}: ${studentName}`),
        style: "subheader",
        alignment: "right",
        fontSize: isStacked ? 9 : 10,
        absolutePosition: {
          y: (isSecond ? 841.89 / 2 : 0) + 35,
        },
      },
      {
        text: reverseArabicWords(
          `حرر في: ${new Date().getDate()}  ${
            arabicMonths[new Date().getMonth()]
          } ${new Date(dates[0]).getFullYear()}`
        ),
        style: "subheader",
        alignment: "left",
        fontSize: isStacked ? 9 : 10,
        absolutePosition: {
          y: (isSecond ? 841.89 / 2 : 0) + 35,
          x: 18,
        },
      },
      // Table
      {
        table: {
          headerRows: 1,
          heights: tableCellHeight,
          widths: [
            25,
            30,
            30,
            ...(isGirls ? [] : [30]),
            20,
            ...(isGirls ? [360] : [325]),
            26,
            22,
          ],
          body: tableBody,
        },
        absolutePosition: {
          y:
            (isStacked
              ? 841.89 / 4 + (isSecond ? 841.89 / 2 : 0)
              : 841.89 / 2) -
            ((dataLength + 1) / 2) * (isStacked ? 13 : 25),
          x: 18,
        },
        layout: {
          paddingLeft: function (i, node) {
            return 3;
          },
          paddingRight: function (i, node) {
            return 3;
          },
          hLineWidth: function (i, node) {
            return 0.3;
          },
          vLineWidth: function (i, node) {
            return 0.3;
          },
          hLineColor: function (i, node) {
            return "#aaaaaa";
          },
          vLineColor: function (i, node) {
            return "#aaaaaa";
          },
          fillColor: function (rowIndex, node, columnIndex) {
            return rowIndex === 0 ? "#f8f9fa" : null;
          },
        },
        margin: [0, 0, 0, 8],
      },

      // Summary section
      ...createCompactSummarySection(data, studentOrder, isSecond, isStacked),
    ];

    return content;
  }

  // Create compact table body for stacked layout
  function createTableBody(studentData, marginTopBottom, isStacked = false) {
    // Arabic headers - two rows for date
    const headerRows = [
      {
        text: "إظافية",
        style: "tableHeader",
        alignment: "center",
        marginTop: marginTopBottom,
        marginBottom: -2,
      },
      {
        text: "اللباس",
        style: "tableHeader",
        alignment: "center",
        marginTop: marginTopBottom,
        marginBottom: -2,
      },
      {
        text: "السلوك",
        style: "tableHeader",
        alignment: "center",
        marginTop: marginTopBottom,
        marginBottom: -2,
      },
      {
        text: "الحلاقة",
        style: "tableHeader",
        alignment: "center",
        marginTop: marginTopBottom,
        marginBottom: -2,
      },
      {
        text: "التأخر",
        style: "tableHeader",
        alignment: "center",
        marginTop: marginTopBottom,
        marginBottom: -2,
      },
      {
        text: "الواجبات",
        style: "tableHeader",
        alignment: "center",
        marginTop: marginTopBottom,
        marginBottom: -2,
      },
      {
        text: "اليوم",
        style: "tableHeader",
        alignment: "center",
        colSpan: 2,
        marginTop: marginTopBottom,
        marginBottom: -2,
      },
      {}, // empty for the second part of date
    ];

    // Adjust headers for girls (remove haircut column)
    if (isGirls) {
      headerRows.splice(3, 1); // Remove haircut from first header row
    }

    // Group records by month and year
    const groupedRecords = groupRecordsByMonthYear(studentData);

    // Create table body
    const body = [];

    groupedRecords.forEach((monthGroup) => {
      const { monthYear, records } = monthGroup;
      const monthRowSpan = calculateMonthRowSpan(records);

      records.forEach((record, recordIndex) => {
        const recordDate = new Date(record.day);
        const day = `${
          arabicDays[recordDate.getDay()]
        } ${recordDate.getDate()}`;

        // Handle absence
        if (record.attendance !== 1) {
          const row = createEmptyArray(isGirls ? 7 : 8); // Create array with correct number of columns

          // Set values for the row (RTL order - from right to left)
          const baseIndex = isGirls ? 6 : 7;

          row[baseIndex] =
            recordIndex === 0
              ? {
                  text: monthYear,
                  style: "tableCell",
                  alignment: "center",
                  rowSpan: monthRowSpan,
                  margin: [-2, marginTopBottom + 4.5 * monthRowSpan, -2, -2],
                }
              : {};

          row[baseIndex - 1] = {
            text: day,
            style: "tableCell",
            alignment: "center",
            margin: [-2, marginTopBottom, -2, -2],
          };

          row[0] = {
            text: "غـــــــــائـــب" + (isGirls ? "ة" : ""),
            style: "tableCell",
            alignment: "center",
            bold: true,
            colSpan: isGirls ? 5 : 6,
            margin: [0, marginTopBottom, 0, -2],
          };

          body.push(row);
          return;
        }

        record.detail = formatDetail(record.detail);
        const clothingOption = document.querySelector(
          `#clothing option[value='${record.clothing}']`
        );
        const haircutOption = document.querySelector(
          `#haircut option[value='${record.haircut}']`
        );
        const behaviorOption = document.querySelector(
          `#behavior option[value='${record.behavior}']`
        );
        const retardOption =
          parseInt(record.retard) > 0
            ? `${parseInt(record.retard)}  د`
            : "بلا  تأخر";

        if (record.detail.length == 1) {
          const row = createEmptyArray(isGirls ? 7 : 8);
          const baseIndex = isGirls ? 6 : 7;

          // Month (only for first record in month group)
          row[baseIndex] =
            recordIndex === 0
              ? {
                  text: monthYear,
                  style: "tableCell",
                  alignment: "center",
                  rowSpan: monthRowSpan,
                  margin: [-2, marginTopBottom + 4.5 * monthRowSpan, -2, -2],
                }
              : {};

          // Day
          row[baseIndex - 1] = {
            text: day,
            style: "tableCell",
            alignment: "center",
            margin: [-2, marginTopBottom, -2, -2],
          };

          // Details
          row[baseIndex - 2] = {
            text: record.detail[0],
            style: "tableCell",
            alignment: "right",
            margin: [0, marginTopBottom, 0, -2],
          };

          // retard
          row[baseIndex - 3] = {
            text: retardOption,
            style: "tableCell",
            alignment: "center",
            margin: [-2, marginTopBottom, -2, -2],
          };
          // Haircut (if not girls)
          if (!isGirls) {
            row[baseIndex - 4] = {
              text: haircutOption ? haircutOption.textContent : "-",
              style: "tableCell",
              alignment: "center",
              margin: [-2, marginTopBottom, -2, -2],
            };
          }

          // Behavior
          const behaviorIndex = isGirls ? baseIndex - 4 : baseIndex - 5;
          row[behaviorIndex] = {
            text: behaviorOption ? behaviorOption.textContent : "-",
            style: "tableCell",
            alignment: "center",
            margin: [-2, marginTopBottom, -2, -2],
          };

          // Clothing
          const clothingIndex = isGirls ? baseIndex - 5 : baseIndex - 6;
          row[clothingIndex] = {
            text: clothingOption ? clothingOption.textContent : "-",
            style: "tableCell",
            alignment: "center",
            margin: [-2, marginTopBottom, -2, -2],
          };

          // Additional points
          const pointsIndex = isGirls ? baseIndex - 6 : baseIndex - 7;
          row[pointsIndex] = {
            text: record.added_points ? record.added_points : "-",
            style: "tableCell",
            alignment: "center",
            margin: [-2, marginTopBottom, -2, -2],
          };

          body.push(row);
        } else {
          // For multiple details, create multiple rows
          record.detail.forEach((detail, detailIndex) => {
            const row = createEmptyArray(isGirls ? 7 : 8);
            const baseIndex = isGirls ? 6 : 7;

            // Month (only for first record and first detail in month group)
            row[baseIndex] =
              recordIndex === 0 && detailIndex === 0
                ? {
                    text: monthYear,
                    style: "tableCell",
                    alignment: "center",
                    rowSpan: monthRowSpan,
                    margin: [-2, marginTopBottom + 4.5 * monthRowSpan, -2, -2],
                  }
                : {};

            // Day (only for first detail in the record)
            row[baseIndex - 1] =
              detailIndex === 0
                ? {
                    text: day,
                    style: "tableCell",
                    alignment: "center",
                    rowSpan: record.detail.length,
                    margin: [
                      -2,
                      marginTopBottom + 4.5 * record.detail.length,
                      -2,
                      -2,
                    ],
                  }
                : {};

            // Detail
            row[baseIndex - 2] = {
              text: detail || "-",
              style: "tableCell",
              alignment: "right",
              margin: [0, marginTopBottom, 0, -2],
            };

            // retard
            row[baseIndex - 3] =
              detailIndex === 0
                ? {
                    text: retardOption,
                    style: "tableCell",
                    alignment: "center",
                    rowSpan: record.detail.length,
                    margin: [-2, 5 * record.detail.length, -2, -2],
                  }
                : {};

            // Haircut (if not girls, only for first detail)
            if (!isGirls) {
              row[baseIndex - 4] =
                detailIndex === 0
                  ? {
                      text: haircutOption ? haircutOption.textContent : "-",
                      style: "tableCell",
                      alignment: "center",
                      rowSpan: record.detail.length,
                      margin: [-2, 5 * record.detail.length, -2, -2],
                    }
                  : {};
            }

            // Behavior (only for first detail)
            const behaviorIndex = isGirls ? baseIndex - 4 : baseIndex - 5;
            row[behaviorIndex] =
              detailIndex === 0
                ? {
                    text: behaviorOption ? behaviorOption.textContent : "-",
                    style: "tableCell",
                    alignment: "center",
                    rowSpan: record.detail.length,
                    margin: [-2, 5 * record.detail.length, -2, -2],
                  }
                : {};

            // Clothing (only for first detail)
            const clothingIndex = isGirls ? baseIndex - 5 : baseIndex - 6;
            row[clothingIndex] =
              detailIndex === 0
                ? {
                    text: clothingOption ? clothingOption.textContent : "-",
                    style: "tableCell",
                    alignment: "center",
                    rowSpan: record.detail.length,
                    margin: [-2, 5 * record.detail.length, -2, -2],
                  }
                : {};

            // Additional points (only for first detail)
            const pointsIndex = isGirls ? baseIndex - 6 : baseIndex - 7;
            row[pointsIndex] =
              detailIndex === 0
                ? {
                    text: record.added_points ? record.added_points : "-",
                    style: "tableCell",
                    alignment: "center",
                    rowSpan: record.detail.length,
                    margin: [-2, 5 * record.detail.length, -2, -2],
                  }
                : {};

            body.push(row);
          });
        }
      });
    });

    return [headerRows, ...body];
  }

  // Helper function to create an empty array with specified length
  function createEmptyArray(length) {
    return new Array(length).fill({});
  }

  // Helper function to group records by month and year
  function groupRecordsByMonthYear(studentData) {
    const groups = {};

    studentData.forEach((record) => {
      const recordDate = new Date(record.day);
      const monthYear = `${
        arabicMonths[recordDate.getMonth()]
      } ${recordDate.getFullYear()}`;

      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }
      groups[monthYear].push(record);
    });

    // Convert to array and sort by date
    return Object.keys(groups)
      .map((monthYear) => ({
        monthYear,
        records: groups[monthYear].sort(
          (a, b) => new Date(a.day) - new Date(b.day)
        ),
      }))
      .sort((a, b) => new Date(a.records[0].day) - new Date(b.records[0].day));
  }

  // Helper function to calculate total rowSpan for a month group
  function calculateMonthRowSpan(records) {
    let totalRows = 0;

    records.forEach((record) => {
      if (record.attendance !== 1) {
        totalRows += 1; // Absent records take 1 row
      } else {
        // Parse detail if it's a string
        let detailArray = record.detail;
        if (typeof detailArray === "string") {
          try {
            detailArray = JSON.parse(detailArray);
          } catch (e) {
            detailArray = [detailArray];
          }
        }
        totalRows +=
          detailArray && Array.isArray(detailArray) ? detailArray.length : 1;
      }
    });

    return totalRows;
  }

  // Create compact summary section
  function createCompactSummarySection(
    studentData,
    studentOrder,
    isSecond,
    isStacked = false
  ) {
    const totalDays =
      studentData.length -
      studentData.filter((record) => record.attendance == 0).length;
    const validRecords = studentData.filter(
      (record) => record.attendance !== null
    );

    if (totalDays === 0) return [];

    const presentDays = validRecords.filter(
      (record) => record.attendance === 1
    ).length;
    const total = validRecords.reduce(
      (sum, record) =>
        sum + (record.requirements_score || 0) + (record.evaluation_score || 0),
      0
    );
    const totalAvg = total / totalDays;

    const attendanceRate = ((presentDays / totalDays) * 100).toFixed(1);

    // Full summary for single student view
    return [
      {
        text: reverseArabicWords("الملخص"),
        style: "summary",
        margin: [0, 5, 0, 8],
        alignment: "center",
        absolutePosition: {
          y: 841.89 / (isStacked && !isSecond ? 2 : 1) - 55,
        },
      },
      {
        table: {
          widths: ["*", "*", "*", "*", "*"],
          body: [
            [
              {
                text: `الترتيب: ${studentOrder}/${
                  getStatisticsSelectedStudentsId().split(",").length
                }`,
                style: "tableCell",
                bold: true,
                alignment: "center",
                border: [false, false, false, false],
                fontSize: 10,
              },
              {
                text: `المعدل العام: ${totalAvg.toFixed(2)}`,
                style: "tableCell",
                alignment: "center",
                bold: true,
                border: [true, false, false, false],
                fontSize: 10,
              },
              {
                text: `المجموع العام: ${total.toFixed(2)}`,
                style: "tableCell",
                alignment: "center",
                bold: true,
                border: [true, false, false, false],
                fontSize: 10,
              },
              {
                text: `نسبة الحضور: ${attendanceRate}%`,
                style: "tableCell",
                alignment: "center",
                border: [true, false, false, false],
                fontSize: 10,
              },
              {
                text: `إجمالي الأيام: ${totalDays}`,
                style: "tableCell",
                alignment: "center",
                border: [true, false, false, false],
                fontSize: 10,
              },
            ],
          ],
        },
        absolutePosition: {
          y: 841.89 / (isStacked && !isSecond ? 2 : 1) - 40,
        },
        margin: [0, 0, 0, 5],
      },
    ];
  }

  // Helper function for compact date formatting
  function formatDateCompact(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    return `${arabicDays[date.getDay()].substring(0, 3)} ${date.getDate()}`;
  }

  // Function to reverse words in a string (for Arabic)
  function reverseArabicWords(str) {
    return str.split(" ").reverse().join(" ");
  }

  function formatDetail(detail) {
    if (!detail) return "-";
    detail = JSON.parse(detail).map((item) => {
      console.log(typeof item["الأخطاء"]);
      const errorsCount = item["الأخطاء"].includes(" ")
        ? parseInt(item["الأخطاء"].split(" ")[0]) +
          parseInt(item["الأخطاء"].split(" ")[4])
        : parseInt(item["الأخطاء"]);
      return (
        item["النوع"] +
        " " +
        (item["الكتاب"] == "القرآن الكريم" ? "" : item["الكتاب"]) +
        "  ]" +
        item["التفاصيل"] +
        " [ " +
        (errorsCount > 0
          ? errorsCount == 1
            ? " بخطأ واحد"
            : " بأخطاء: " + errorsCount
          : " بدون أخطاء") +
        " | " +
        " بتقدير: " +
        item["التقدير"] +
        "/10  | " +
        " بمجموع: " +
        item["المعدل"] +
        "  نقطة "
      );
    });
    return detail;
  }
}

async function showStudentsResultsStatistics() {
  let [dates, isFullMonth] = getDatesInRange();
  dates = dates.sort((a, b) => new Date(a) - new Date(b));

  if (!dates.length) {
    window.showToast("warning", "لا توجد أيام في هذا النطاق.");
    statisticType.value = "0";
    return;
  }

  const dateCtes = dates
    .map(
      (date, index) =>
        `day_id${index} AS ( SELECT id FROM education_day WHERE date = '${date}' )`
    )
    .join(", \n");

  // Generate date columns
  const dateColumns = dates
    .map(
      (date, index) =>
        `COALESCE(ROUND(
              (SELECT SUM(moyenne) FROM day_evaluations WHERE student_id = s.id AND day_id IN (SELECT id FROM day_id${index}))
              + 
              (SELECT COALESCE(SUM(moyenne), 0) FROM day_requirements WHERE student_id = s.id AND day_id IN (SELECT id FROM day_id${index}))
          , 2), "غ") as '${arabicDays[new Date(date).getDay()]} ${new Date(
          date
        ).getDate()}'`
    )
    .join(",\n    ");

  // Generate sum expressions for المجموع
  const sumExpressions = dates
    .map(
      (date, index) =>
        `(SELECT COALESCE(SUM(de.moyenne), 0) FROM day_evaluations de 
          WHERE de.student_id = s.id AND de.day_id IN (SELECT id FROM day_id${index}))
          + 
          (SELECT COALESCE(SUM(dr.moyenne), 0) FROM day_requirements dr 
          WHERE dr.student_id = s.id AND dr.day_id IN (SELECT id FROM day_id${index}))
        `
    )
    .join(" +\n        ");

  const query = `
    WITH ${dateCtes}
    SELECT 
        ROW_NUMBER() OVER (ORDER BY s.id) as "#", 
        s.fname || ' ' || s.lname as "اسم الطالب",
        ${dateColumns},
        -- المجموع (Total)
        COALESCE( ROUND(
            ${sumExpressions}
        , 2), 0 ) as "المجموع",
        -- المعدل (Average)
        COALESCE( ROUND(
            (${sumExpressions}) / (${dates.length}-(
                                    SELECT count(attendance)
                                    FROM day_evaluations
                                    WHERE student_id = s.id
                                    AND attendance = 0
                                    AND day_id in (SELECT id FROM education_day WHERE date in (${
                                      '"' + dates.join('","') + '"'
                                    }))
                                    ))
        , 2), 0 ) as "المعدل",
        -- الترتيب (order)
        ROW_NUMBER() OVER (ORDER BY 
        COALESCE( ROUND(
            (${sumExpressions}) / (${dates.length}-(
                                    SELECT count(attendance)
                                    FROM day_evaluations
                                    WHERE student_id = s.id
                                    AND attendance = 0
                                    AND day_id in (SELECT id FROM education_day WHERE date in (${
                                      '"' + dates.join('","') + '"'
                                    }))
                                    ))
        , 2), 0 ) DESC ) as "الترتيب"
    FROM students s 
    LEFT JOIN day_evaluations de ON s.id = de.student_id 
    LEFT JOIN day_requirements dr ON dr.student_id = s.id 
    WHERE s.id in (${getStatisticsSelectedStudentsId()})
    GROUP BY s.id, "اسم الطالب" 
    ORDER BY s.id;
`;
  const buttons = [
    ...(dates.length > 16
      ? []
      : [
          {
            extend: "pdfHtml5",
            download: "open",
            text: "انشاء PDF",
            className: "btn btn-primary",
            customize: async function (doc) {
              const daysCount = dates.length;
              doc.pageSize = "A4";
              doc.pageOrientation = "landscape";
              doc.content[0].text = "نتائج  الطلاب";
              doc.content[0].alignment = "center";
              doc.content[0].fontSize = 16;
              doc.content[0].margin = [0, 0, 0, 20];

              doc.styles.tableHeader.alignment = "left";
              doc.content[1].table.widths =
                daysCount >= 12
                  ? Array(doc.content[1].table.body[0].length + 1)
                      .join("auto,")
                      .split(",")
                      .slice(0, -1)
                  : Array(doc.content[1].table.body[0].length + 1)
                      .join("*")
                      .split("");

              doc.content[1].table.widths[
                doc.content[1].table.body[0].length - 1
              ] = 15;
              doc.content[1].table.widths[
                doc.content[1].table.body[0].length - 2
              ] = 100;
              // reverse rows for RTL
              doc.content[1].table.body.forEach((b) => {
                b.reverse();
                b.forEach((cell) => {
                  cell.alignment = "center";
                  cell.marginTop = 3;
                  cell.marginLeft = cell.marginRight = -3;
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
                  const key = `${arabicMonths[Number(month) - 1]} ${year}`;
                  if (!monthMap[key]) {
                    monthMap[key] = { start: idx, count: 1 };
                    monthOrder.push(key);
                  } else {
                    monthMap[key].count++;
                  }
                  cell.text = `${arabicDays[new Date(cell.text).getDay()]}\n${
                    cell.text.split("-")[2]
                  }`;
                  if (daysCount >= 12) {
                    cell.marginLeft = cell.marginRight = Number(
                      (((daysCount - 12) * -7) / 4 + 4).toFixed(1)
                    );
                  }
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

              // Set rowSpan for the first two columns and the last two columns
              tableBody[0].forEach((cell, idx) => {
                if ([0, 1, 2, daysCount + 3, daysCount + 4].includes(idx)) {
                  cell.rowSpan = -2;
                }
              });

              // set layout
              doc.content[1].layout = {
                hLineWidth: function (i, node) {
                  return i === 0 || i === node.table.body.length ? 2 : 1;
                },
                vLineWidth: function (i, node) {
                  return i === 0 || i === node.table.widths.length ? 2 : 1;
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
        ]),
    ...(dates.length > 25
      ? []
      : [
          {
            text: "كشوف النقاط",
            action: async function (e, dt) {
              await showLoadingModal("جاري تحميل الإحصائيات");
              showStudentsBulletins(dates);
              hideLoadingModal();
            },
          },
        ]),
  ];
  setStatisticsTable(query, buttons);
}

async function showAttendanceStatistics() {
  let [dates, isFullMonth] = getDatesInRange();
  dates = dates.sort((a, b) => new Date(a) - new Date(b));

  if (!dates.length) {
    window.showToast("warning", "لا توجد أيام في هذا النطاق.");
    statisticType.value = "0";
    return;
  }

  const dateCtes = dates
    .map(
      (date, index) =>
        `day_id${index} AS ( SELECT id FROM education_day WHERE date = '${date}' )`
    )
    .join(",\n");

  const dateColumns = dates
    .map(
      (date, index) =>
        `CASE 
        WHEN de${index}.id IS NULL THEN 'غ'
        WHEN de${index}.attendance = 1 THEN 'ح'
        WHEN de${index}.attendance = 0 THEN 'غ م'
        ELSE 'غ'
    END as '${arabicDays[new Date(date).getDay()]} ${new Date(date).getDate()}'`
    )
    .join(",\n    ");

  const dateJoins = dates
    .map(
      (date, index) =>
        `LEFT JOIN day_evaluations de${index} ON s.id = de${index}.student_id AND de${index}.day_id IN (SELECT id FROM day_id${index})`
    )
    .join("\n");

  const attendanceSum = dates
    .map((_, index) => `CASE WHEN de${index}.attendance = 1 THEN 1 ELSE 0 END`)
    .join(" +\n        ");

  const query = `
    WITH ${dateCtes}
    SELECT
        ROW_NUMBER() OVER (ORDER BY s.id) as "#",
        s.fname || ' ' || s.lname as "اسم الطالب",
        ${dateColumns},
        -- مجموع الحضور (Total Present Days Count)
        (${attendanceSum}) as "المجموع (/${dates.length})",
        -- نسبة الحضور (Attendance Percentage)
        ROUND(
            ((${attendanceSum}) * 100.0 / ${dates.length}), 1
        ) as "النسبة (%)"
    FROM students s
    ${dateJoins}
    WHERE s.id in (${getStatisticsSelectedStudentsId()})
    GROUP BY s.id
    ORDER BY s.id;
`;

  const buttons =
    dates.length > 16
      ? []
      : [
          {
            extend: "pdfHtml5",
            download: "open",
            text: "انشاء PDF",
            className: "btn btn-primary",
            customize: async function (doc) {
              const daysCount = dates.length;
              doc.pageSize = "A4";
              doc.pageOrientation = "landscape";
              doc.content[0].text = "جدول حضور الطلاب";
              doc.content[0].alignment = "center";
              doc.content[0].fontSize = 16;
              doc.content[0].margin = [0, 0, 0, 20];

              doc.styles.tableHeader.alignment = "left";
              doc.content[1].table.widths =
                daysCount >= 13
                  ? Array(doc.content[1].table.body[0].length + 1)
                      .join("auto,")
                      .split(",")
                      .slice(0, -1)
                  : Array(doc.content[1].table.body[0].length + 1)
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
                  cell.marginLeft = cell.marginRight = -3;
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
                  const key = `${arabicMonths[Number(month) - 1]} ${year}`;
                  if (!monthMap[key]) {
                    monthMap[key] = { start: idx, count: 1 };
                    monthOrder.push(key);
                  } else {
                    monthMap[key].count++;
                  }
                  cell.text = `${arabicDays[new Date(cell.text).getDay()]}\n${
                    cell.text.split("-")[2]
                  }`;
                  if (daysCount >= 13) {
                    cell.marginLeft = cell.marginRight =
                      ((16 - Math.max(13, Math.min(16, daysCount))) * 3) / 3;
                  }
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

              // Set rowSpan for the first two columns and the last two columns
              tableBody[0].forEach((cell, idx) => {
                if ([0, 1, daysCount + 2, daysCount + 3].includes(idx)) {
                  cell.rowSpan = -2;
                }
              });

              // set layout
              doc.content[1].layout = {
                hLineWidth: function (i, node) {
                  return i === 0 || i === node.table.body.length ? 2 : 1;
                },
                vLineWidth: function (i, node) {
                  return i === 0 || i === node.table.widths.length ? 2 : 1;
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
        ];
  setStatisticsTable(query, buttons);
}

async function setStatisticsTable(query, buttons = []) {
  const result = project_db.exec(query);

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
          fixedHeader: true,
          fixedColumns: {
            start: 1,
          },
          columnDefs: [{ targets: 0, visible: false }],
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
                ...[
                  {
                    text: '<i class="fa-solid fa-arrows-rotate"></i>',
                    action: async function () {
                      statisticType.dispatchEvent(new Event("change"));
                    },
                  },
                ],
                ...buttons,
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
  db.exec("SELECT * FROM quran_index")[0].values.forEach((row) => {
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
  // option.className = "text-truncate"
  return option;
};

const checkSecondSurahAyahs = (secondSurahNumber) => {
  if (secondSurahNumber) {
    let ll = 1;
    secondAyahSelect.disabled = false;
    secondAyahSelect.innerHTML = "";
    if (
      parseInt(firstSurahSelect.value) === parseInt(secondSurahSelect.value)
    ) {
      ll = parseInt(firstAyahSelect.value) || 1;
      for (let i = ll - 1; i < firstAyahSelect.options.length; i++) {
        const option = firstAyahSelect.options[i];
        const clonedOption = option.cloneNode(true);
        secondAyahSelect.appendChild(clonedOption);
      }
    } else {
      const secondSurahSelectedOption =
        secondSurahSelect.options[secondSurahSelect.selectedIndex];
      quran_db
        .exec(
          "SELECT * FROM quran_ayat WHERE sura = " +
            secondSurahSelectedOption.value
        )[0]
        .values.forEach((row) => {
          secondAyahSelect.appendChild(
            createOption(row[1], `${row[1]}- ${row[2]}`)
          );
        });
    }

    secondAyahSelect.lastChild.selected = true;
    secondAyahSelect.dispatchEvent(new Event("change"));
  } else {
    secondAyahSelect.disabled = true;
    secondAyahSelect.innerHTML = "";
    secondAyahSelect.appendChild(createOption("", "--  --"));
  }
};

function setRequirQuantityDetailInput() {
  try {
    requirQuantityDetailInput.value = `${
      firstSurahSelect.options[firstSurahSelect.selectedIndex].text
    } - ${firstAyahSelect.options[firstAyahSelect.selectedIndex].value} إلى ${
      secondSurahSelect.options[secondSurahSelect.selectedIndex].text
    } - ${secondAyahSelect.options[secondAyahSelect.selectedIndex].value}`;
    setRequirEvalInput();
  } catch (err) {
    requirQuantityDetailInput.value = "";
  }
}

firstSurahSelect.onchange = async function () {
  const firstSurahNumber = parseInt(this.value);

  if (firstSurahNumber) {
    firstAyahSelect.disabled = false;
    firstAyahSelect.innerHTML = "";

    quran_db
      .exec("SELECT * FROM quran_ayat WHERE sura = " + this.value)[0]
      .values.forEach((row) => {
        firstAyahSelect.appendChild(
          createOption(row[1], `${row[1]}- ${row[2]}`)
        );
      });

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
    ];

    if (surah2.number - surah1.number > 1) {
      for (let i = surah1.number + 1; i <= surah2.number - 1; i++) {
        result.push({
          number: i,
          ayah: generateAyahRange(),
        });
      }
    }

    result.push({
      number: surah2.number,
      ayah: generateAyahRange(1, ayahNum2),
    });
  }

  // Include all surahs between them if they're not consecutive
  const start = Math.min(surah1.number, surah2.number);
  const end = Math.max(surah1.number, surah2.number);

  for (let i = start + 1; i < end; i++) {
    const betweenSurah = surahsData.find((s) => s.number === i);
    if (betweenSurah) {
      result.slice(result.length - 1, 0, {
        number: betweenSurah.number,
        ayah: generateAyahRange(1, betweenSurah.numberOfAyahs),
      });
    }
  }

  return result;
};

const generateAyahRange = (start, end) => {
  if (!end && !start) return "";
  return `${start}-${end}`;
};

const generatelignCount = (ranges) => {
  const conditions = ranges
    .map((range) => {
      if (range.ayah) {
        const [start, end] = range.ayah.split("-").map(Number);
        return `(sura = ${range.number} AND ayah BETWEEN ${start} AND ${end})`;
      } else {
        return `(sura = ${range.number} AND ayah)`;
      }
    })
    .join(" OR\n  ");

  return `
    SELECT 
      ROUND(SUM(lign_count), 1) AS rounded_total
    FROM quran_ayat
    WHERE ${conditions};
  `;
};

function deleteTableRow(tableSelector, columnName, columnValue) {
  const table = $(tableSelector).DataTable();
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
// function countLines(text) {
//   const ctx = document.createElement("canvas").getContext("2d");
//   ctx.font = "22.4px Arial";
//   ctx.direction = "rtl";
//   return ctx.measureText(text).width / (10 * 37.8);
// }

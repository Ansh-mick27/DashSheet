// ============================================================
// DashSheet — Google Apps Script  (Separate Forms Version)
// ============================================================
// SETUP ORDER (run each ONCE, in order):
//   1. createSpreadsheet()      — creates the data spreadsheet
//   2. createSeparateForms()    — creates 4 role-specific forms
//   3. Deploy doGet() as Web App — Execute as: Me, Anyone
//
// Share the 4 form URLs from the execution log with your staff.
// ============================================================

// ---- Customise these lists before running ----
var TRAINER_NAMES      = [
  'Aarav Sharma','Priya Patel','Rohan Gupta','Neha Singh','Vikram Reddy',
  'Ananya Iyer','Karan Mehta','Divya Joshi','Arjun Nair','Sneha Das',
  'Rahul Verma','Pooja Mishra','Aditya Kumar','Riya Banerjee','Siddharth Rao',
  'Meera Choudhary','Nikhil Saxena','Kavya Menon','Dhruv Tiwari','Ishita Kapoor'
];
var OFFICE_ADMIN_NAMES = ['Suresh Pillai', 'Rekha Nambiar'];
var PLACEMENT_NAMES    = ['Manish Yadav', 'Shreya Agarwal', 'Varun Bhatt'];

var DEPARTMENTS = ['Computer Science','Data Science','Web Development','Mobile Development','Cloud Computing'];
var BATCHES     = ['Batch A','Batch B','Batch C','Batch D','Batch E'];
var COURSES     = [
  'Python Fundamentals','React Development','Data Structures & Algorithms',
  'Machine Learning Basics','Cloud Architecture','Full Stack Development',
  'UI/UX Design','DevOps Practices','Cybersecurity Essentials','Database Management','Other'
];
var TIME_SLOTS  = [
  '08:30 - 09:30','09:30 - 10:30','10:30 - 11:30','11:30 - 12:30',
  '01:30 - 02:30','02:30 - 03:30','03:30 - 04:30','04:30 - 05:30'
];
var TASKS = [
  'Prepare lecture materials','Conduct training session','Student assessment',
  'Review homework submissions','One-on-one mentoring','Update course content',
  'Team meeting','Practical lab session','Create quiz questions',
  'Grade assignments','Curriculum planning','Industry interaction session',
  'Documentation update','Research new topics','Other'
];
var INVENTORY_ITEMS = [
  'Laptop','Desktop PC','Projector','Whiteboard','Printer','UPS Battery',
  'Extension Board','HDMI Cable','Webcam','Headset','Office Chair','Study Table',
  'Marker Set','Notebook Stack','Speaker System','Router','Switch','External HDD','Other'
];


// ============================================================
// STEP 1 — Create the spreadsheet (run once)
// ============================================================
function createSpreadsheet() {
  var ss = SpreadsheetApp.create('DashSheet Data');
  _ensureSheet(ss, 'Members');
  _ensureSheet(ss, 'TrainingReports');
  _ensureSheet(ss, 'WorkReports');
  _ensureSheet(ss, 'InventoryReports');
  _ensureSheet(ss, 'PlacementReports');
  _populateMembersSheet(ss);
  PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', ss.getId());
  Logger.log('Spreadsheet created: ' + ss.getUrl());
  Logger.log('Spreadsheet ID saved. Now run createSeparateForms().');
}


// ============================================================
// STEP 2 — Create 4 separate forms (run once)
// ============================================================
function createSeparateForms() {
  var ssId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!ssId) { Logger.log('ERROR: Run createSpreadsheet() first.'); return; }
  var ss = SpreadsheetApp.openById(ssId);

  // --- Form 1: Trainer Training Report ---
  var f1 = FormApp.create('CDC — Trainer Training Report');
  f1.setDescription('Fill this form after every training session.');
  f1.setCollectEmail(false);
  f1.addListItem().setTitle('Trainer Name').setChoiceValues(TRAINER_NAMES).setRequired(true);
  f1.addDateItem().setTitle('Date of Session').setRequired(true);
  f1.addListItem().setTitle('Department').setChoiceValues(DEPARTMENTS).setRequired(true);
  f1.addListItem().setTitle('Batch').setChoiceValues(BATCHES).setRequired(true);
  f1.addListItem().setTitle('Course Name').setChoiceValues(COURSES).setRequired(true);
  f1.addTextItem().setTitle('Topic Covered').setRequired(true);
  f1.addListItem().setTitle('Session Duration').setChoiceValues(['1 Hour','2 Hours','3 Hours','Full Day']).setRequired(true);
  f1.addCheckboxItem().setTitle('Teaching Methods Used').setChoiceValues(['Lecture','Group Discussion','Case Study','Role Play','Presentation','Practical','Online Demo']).setRequired(true);
  f1.addTextItem().setTitle('Total Students Enrolled').setRequired(true);
  f1.addTextItem().setTitle('Students Present').setRequired(true);
  f1.addListItem().setTitle('Participation Level').setChoiceValues(['High','Moderate','Low']).setRequired(true);
  f1.addParagraphTextItem().setTitle('Learning Objectives').setRequired(false);
  f1.addParagraphTextItem().setTitle('Engagement Observations').setRequired(false);
  f1.addParagraphTextItem().setTitle('Challenges Faced').setRequired(false);
  f1.addParagraphTextItem().setTitle('Action Plan for Next Session').setRequired(false);
  f1.setDestination(FormApp.DestinationType.SPREADSHEET, ssId);

  // --- Form 2: Trainer Work Report ---
  var f2 = FormApp.create('CDC — Trainer Work Report');
  f2.setDescription('Fill this form at the end of each working day.');
  f2.setCollectEmail(false);
  f2.addListItem().setTitle('Trainer Name').setChoiceValues(TRAINER_NAMES).setRequired(true);
  f2.addDateItem().setTitle('Date').setRequired(true);
  f2.addListItem().setTitle('Department').setChoiceValues(DEPARTMENTS).setRequired(true);
  f2.addListItem().setTitle('Batch').setChoiceValues(BATCHES).setRequired(true);
  TIME_SLOTS.forEach(function(slot) {
    f2.addListItem().setTitle('Task — ' + slot).setChoiceValues(TASKS).setRequired(false);
    f2.addListItem().setTitle('Status — ' + slot).setChoiceValues(['Completed','Pending','Not Applicable']).setRequired(false);
  });
  f2.addParagraphTextItem().setTitle('Key Accomplishments Today').setRequired(false);
  f2.addParagraphTextItem().setTitle('Pending Work').setRequired(false);
  f2.addParagraphTextItem().setTitle('Challenges & Solutions').setRequired(false);
  f2.setDestination(FormApp.DestinationType.SPREADSHEET, ssId);

  // --- Form 3: Office Admin Inventory Report ---
  var f3 = FormApp.create('CDC — Office Admin Inventory Report');
  f3.setDescription('Log every inventory item added, removed, repaired or audited.');
  f3.setCollectEmail(false);
  f3.addListItem().setTitle('Staff Name').setChoiceValues(OFFICE_ADMIN_NAMES).setRequired(true);
  f3.addDateItem().setTitle('Date').setRequired(true);
  f3.addListItem().setTitle('Item Name').setChoiceValues(INVENTORY_ITEMS).setRequired(true);
  f3.addListItem().setTitle('Item Category').setChoiceValues(['Electronics','Furniture','Stationery','Equipment','Other']).setRequired(true);
  f3.addTextItem().setTitle('Quantity').setRequired(true);
  f3.addListItem().setTitle('Item Condition').setChoiceValues(['New','Good','Fair','Poor','Damaged']).setRequired(true);
  f3.addListItem().setTitle('Action Taken').setChoiceValues(['Added','Removed','Repaired','Maintenance','Audited']).setRequired(true);
  f3.addListItem().setTitle('Location / Room').setChoiceValues(['Lab 1','Lab 2','Lab 3','Staff Room','Principal Office','Store Room','Conference Room','Other']).setRequired(true);
  f3.addParagraphTextItem().setTitle('Additional Notes').setRequired(false);
  f3.setDestination(FormApp.DestinationType.SPREADSHEET, ssId);

  // --- Form 4: Placement Company Sourcing Tracker ---
  var f4 = FormApp.create('CDC — Company Sourcing Tracker');
  f4.setDescription('Log every company you source or follow up with for placement. One entry per company per update.');
  f4.setCollectEmail(false);
  f4.addListItem().setTitle('Staff Name').setChoiceValues(PLACEMENT_NAMES).setRequired(true);
  f4.addTextItem().setTitle('Company Name').setRequired(true);
  f4.addListItem().setTitle('Industry Sector').setChoiceValues(['IT / Software','Consulting','Manufacturing','BFSI','EdTech','Healthcare','E-Commerce','FMCG','Automobile','Other']).setRequired(true);
  f4.addListItem().setTitle('Company Type').setChoiceValues(['MNC','Startup','PSU / Large Corp','Private Sector','Other']).setRequired(true);
  f4.addTextItem().setTitle('HQ Location').setRequired(false);
  f4.addTextItem().setTitle('Contact Person').setRequired(false);
  f4.addTextItem().setTitle('Designation').setRequired(false);
  f4.addTextItem().setTitle('Email ID').setRequired(false);
  f4.addTextItem().setTitle('Phone Number').setRequired(false);
  f4.addListItem().setTitle('Source Channel').setChoiceValues(['Alumni Reference','LinkedIn Outreach','Company Portal','Job Fair','College Website','Direct Approach','Other']).setRequired(true);
  f4.addDateItem().setTitle('Date of First Contact').setRequired(true);
  f4.addListItem().setTitle('Mode of Contact').setChoiceValues(['Email','Phone Call','Video Call','In-Person Meeting','LinkedIn']).setRequired(true);
  f4.addListItem().setTitle('Current Status').setChoiceValues(['Identified','Email Sent','JD Sent','Under Discussion','In Negotiation','MoU Signed','Drive Scheduled','Drive Completed','No Response','Blacklisted']).setRequired(true);
  f4.addTextItem().setTitle('Roles Offered').setRequired(false);
  f4.addTextItem().setTitle('Number of Openings').setRequired(false);
  f4.addTextItem().setTitle('CTC (LPA)').setRequired(false);
  f4.addTextItem().setTitle('Drive Date (DD/MM/YYYY or TBD)').setRequired(false);
  f4.addTextItem().setTitle('Students Selected').setRequired(false);
  f4.addParagraphTextItem().setTitle('Remarks / Next Steps').setRequired(false);
  f4.addListItem().setTitle('Priority').setChoiceValues(['High','Medium','Low']).setRequired(true);
  f4.setDestination(FormApp.DestinationType.SPREADSHEET, ssId);

  // Save form URLs
  PropertiesService.getScriptProperties().setProperties({
    'TRAINING_FORM_URL'  : f1.getPublishedUrl(),
    'WORK_FORM_URL'      : f2.getPublishedUrl(),
    'INVENTORY_FORM_URL' : f3.getPublishedUrl(),
    'PLACEMENT_FORM_URL' : f4.getPublishedUrl()
  });

  Logger.log('======= 4 Forms Created =======');
  Logger.log('Training Form  : ' + f1.getPublishedUrl());
  Logger.log('Work Form      : ' + f2.getPublishedUrl());
  Logger.log('Inventory Form : ' + f3.getPublishedUrl());
  Logger.log('Placement Form : ' + f4.getPublishedUrl());
  Logger.log('');
  Logger.log('Share the above links with the respective staff.');
  Logger.log('Now deploy doGet() as a Web App and paste the URL in DashSheet Settings.');
}


// ============================================================
// STEP 3 — Web App endpoint (deploy this as Web App)
// Reads all Form Response sheets and identifies each by its
// unique column headers — works regardless of sheet tab names.
// ============================================================
function doGet() {
  var ssId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  var ss   = SpreadsheetApp.openById(ssId);

  var members            = _readSheet(ss, 'Members');
  var trainingReports    = [];
  var workReports        = [];
  var officeAdminReports = [];
  var placementReports   = [];

  var sheets = ss.getSheets();
  sheets.forEach(function(sheet) {
    var data = sheet.getDataRange().getValues();
    if (data.length < 2) return;
    var headers = data[0].map(String);
    var rows    = data.slice(1);

    if (_hasCol(headers, 'Date of Session')) {
      // Training form responses
      rows.forEach(function(row) { trainingReports.push(_parseTraining(headers, row)); });

    } else if (_hasCol(headers, 'Task — 08:30 - 09:30')) {
      // Work form responses
      rows.forEach(function(row) { workReports.push(_parseWork(headers, row)); });

    } else if (_hasCol(headers, 'Item Name') && _hasCol(headers, 'Item Condition')) {
      // Inventory form responses
      rows.forEach(function(row) { officeAdminReports.push(_parseInventory(headers, row)); });

    } else if (_hasCol(headers, 'Date of First Contact')) {
      // Placement sourcing form responses
      rows.forEach(function(row) { placementReports.push(_parsePlacement(headers, row)); });
    }
  });

  return ContentService
    .createTextOutput(JSON.stringify({
      members:            members,
      trainingReports:    trainingReports,
      workReports:        workReports,
      officeAdminReports: officeAdminReports,
      placementReports:   placementReports
    }))
    .setMimeType(ContentService.MimeType.JSON);
}


// ============================================================
// PARSERS — one per form type
// ============================================================

function _parseTraining(h, row) {
  var methods = String(_c(h, row, 'Teaching Methods Used'));
  return {
    timestamp:              String(row[0]),
    trainerName:            String(_c(h, row, 'Trainer Name')),
    date:                   _fmt(row[0], _c(h, row, 'Date of Session')),
    batch:                  String(_c(h, row, 'Batch')),
    course:                 String(_c(h, row, 'Course Name')),
    topicCovered:           String(_c(h, row, 'Topic Covered')),
    duration:               String(_c(h, row, 'Session Duration')),
    learningObjectives:     String(_c(h, row, 'Learning Objectives')),
    methods: {
      lecture:         methods.indexOf('Lecture')          !== -1,
      groupDiscussion: methods.indexOf('Group Discussion') !== -1,
      caseStudy:       methods.indexOf('Case Study')       !== -1,
      rolePlay:        methods.indexOf('Role Play')        !== -1,
      presentation:    methods.indexOf('Presentation')     !== -1,
      practical:       methods.indexOf('Practical')        !== -1,
      other: ''
    },
    studentsPresent:        parseInt(_c(h, row, 'Students Present'))        || 0,
    totalEnrolled:          parseInt(_c(h, row, 'Total Students Enrolled')) || 0,
    participationLevel:     String(_c(h, row, 'Participation Level'))       || 'Moderate',
    engagementObservations: String(_c(h, row, 'Engagement Observations')),
    challengesTrainer:      String(_c(h, row, 'Challenges Faced')),
    challengesStudent:      '',
    actionPlan:             String(_c(h, row, 'Action Plan for Next Session')),
    feedback:               '',
    reviewedBy:             ''
  };
}

function _parseWork(h, row) {
  var slots = [
    '08:30 - 09:30','09:30 - 10:30','10:30 - 11:30','11:30 - 12:30',
    '01:30 - 02:30','02:30 - 03:30','03:30 - 04:30','04:30 - 05:30'
  ];
  var timeSlots = slots.map(function(slot) {
    var sv = String(_c(h, row, 'Status — ' + slot));
    return {
      timeSlot: slot,
      task:     String(_c(h, row, 'Task — ' + slot)),
      status:   sv === 'Completed' ? 'Completed' : sv === 'Pending' ? 'Pending' : '',
      remarks:  ''
    };
  });
  return {
    timestamp:           String(row[0]),
    trainerName:         String(_c(h, row, 'Trainer Name')),
    date:                _fmt(row[0], _c(h, row, 'Date')),
    department:          String(_c(h, row, 'Department')),
    batch:               String(_c(h, row, 'Batch')),
    timeSlots:           timeSlots,
    keyAccomplishments:  String(_c(h, row, 'Key Accomplishments Today')),
    challengesSolutions: String(_c(h, row, 'Challenges & Solutions')),
    pendingWork:         String(_c(h, row, 'Pending Work')),
    additionalNotes:     '',
    reviewedBy:          ''
  };
}

function _parseInventory(h, row) {
  return {
    timestamp:    String(row[0]),
    staffName:    String(_c(h, row, 'Staff Name')),
    date:         _fmt(row[0], _c(h, row, 'Date')),
    itemName:     String(_c(h, row, 'Item Name')),
    itemCategory: String(_c(h, row, 'Item Category'))  || 'Other',
    quantity:     parseInt(_c(h, row, 'Quantity'))      || 1,
    condition:    String(_c(h, row, 'Item Condition'))  || 'Good',
    actionTaken:  String(_c(h, row, 'Action Taken'))    || 'Audited',
    location:     String(_c(h, row, 'Location / Room')),
    notes:        String(_c(h, row, 'Additional Notes'))
  };
}

function _parsePlacement(h, row) {
  return {
    timestamp:          String(row[0]),
    staffName:          String(_c(h, row, 'Staff Name')),
    companyName:        String(_c(h, row, 'Company Name')),
    industrySector:     String(_c(h, row, 'Industry Sector'))    || 'Other',
    companyType:        String(_c(h, row, 'Company Type'))        || 'Other',
    hqLocation:         String(_c(h, row, 'HQ Location')),
    contactPerson:      String(_c(h, row, 'Contact Person')),
    designation:        String(_c(h, row, 'Designation')),
    emailId:            String(_c(h, row, 'Email ID')),
    phoneNumber:        String(_c(h, row, 'Phone Number')),
    sourceChannel:      String(_c(h, row, 'Source Channel'))     || 'Other',
    dateOfFirstContact: _fmt(row[0], _c(h, row, 'Date of First Contact')),
    modeOfContact:      String(_c(h, row, 'Mode of Contact'))    || 'Email',
    currentStatus:      String(_c(h, row, 'Current Status'))     || 'Identified',
    rolesOffered:       String(_c(h, row, 'Roles Offered')),
    numberOfOpenings:   parseInt(_c(h, row, 'Number of Openings'))   || 0,
    ctcLPA:             parseFloat(_c(h, row, 'CTC (LPA)'))          || 0,
    driveDate:          String(_c(h, row, 'Drive Date (DD/MM/YYYY or TBD)')) || 'TBD',
    studentsSelected:   parseInt(_c(h, row, 'Students Selected'))    || 0,
    remarks:            String(_c(h, row, 'Remarks / Next Steps')),
    priority:           String(_c(h, row, 'Priority'))           || 'Medium'
  };
}


// ============================================================
// HELPERS
// ============================================================

// Get value by exact column header name
function _c(headers, row, name) {
  var idx = headers.indexOf(name);
  return idx !== -1 ? row[idx] : '';
}

// Check if a header exists in the sheet
function _hasCol(headers, name) {
  return headers.indexOf(name) !== -1;
}

// Format a date value from a form response to DD/MM/YYYY
function _fmt(fallback, val) {
  var d = new Date(val || fallback);
  if (isNaN(d.getTime())) return String(val || '');
  return String(d.getDate()).padStart(2,'0') + '/' +
         String(d.getMonth()+1).padStart(2,'0') + '/' +
         d.getFullYear();
}

// Read a named sheet using first row as headers
function _readSheet(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  var headers = data[0];
  return data.slice(1).map(function(row) {
    var obj = {};
    headers.forEach(function(h, i) { obj[h] = row[i]; });
    return obj;
  });
}

// Run this any time you change the name lists at the top of the script
function updateMembersSheet() {
  var ssId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!ssId) { Logger.log('ERROR: Run createSpreadsheet() first.'); return; }
  _populateMembersSheet(SpreadsheetApp.openById(ssId));
  Logger.log('Members sheet updated with new names.');
}

function _ensureSheet(ss, name) {
  if (!ss.getSheetByName(name)) ss.insertSheet(name);
}

function _populateMembersSheet(ss) {
  var sheet   = ss.getSheetByName('Members');
  var depts   = ['Computer Science','Data Science','Web Development','Mobile Development','Cloud Computing'];
  var batches = ['Batch A','Batch B','Batch C','Batch D','Batch E'];
  sheet.clearContents();
  sheet.appendRow(['name','department','batch','email','role']);
  TRAINER_NAMES.forEach(function(name, i) {
    sheet.appendRow([name, depts[i%depts.length], batches[i%batches.length],
      name.toLowerCase().replace(' ','.') + '@org.com', i < 3 ? 'Admin' : 'Trainer']);
  });
  OFFICE_ADMIN_NAMES.forEach(function(name) {
    sheet.appendRow([name,'Administration','-',name.toLowerCase().replace(' ','.') + '@org.com','OfficeAdmin']);
  });
  PLACEMENT_NAMES.forEach(function(name) {
    sheet.appendRow([name,'Placement Cell','-',name.toLowerCase().replace(' ','.') + '@org.com','Placement']);
  });
}

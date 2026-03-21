# DashSheet Google Sheets Integration Guide

This guide explains how to link your DashSheet React dashboard to a Google Sheet using Google Apps Script. 

The application is already set up to fetch data from an external URL if provided. You need to create a Google Sheet with specific tabs, add an Apps Script to it, and then plug the created URL into your DashSheet app.

## 1. Create the Google Sheet Structure

Create a new Google Sheet. You need to create **three separate tabs (worksheets)** exactly named as follows:

### Tab 1: `Members`
This sheet stores the list of trainers/admins.
**Required Headers (Row 1):**
* `Name` (e.g., Anshul)
* `Department` (e.g., Web Development)
* `Batch` (e.g., Batch A)
* `Email` (e.g., anshul@org.com)
* `Role` (Must be either `Admin` or `Trainer`)

### Tab 2: `TrainingReports`
This sheet logs the daily training sessions.
**Required Headers (Row 1):**
* `Timestamp` (Date/Time of submission)
* `TrainerName` (Name of the trainer)
* `Date` (Format: DD/MM/YYYY)
* `Batch` (e.g., Batch A)
* `Course` (e.g., React Development)
* `TopicCovered` (e.g., Hooks)
* `LearningObjectives`
* `Methods_Lecture` (TRUE/FALSE)
* `Methods_GroupDiscussion` (TRUE/FALSE)
* `Methods_CaseStudy` (TRUE/FALSE)
* `Methods_RolePlay` (TRUE/FALSE)
* `Methods_Presentation` (TRUE/FALSE)
* `Methods_Practical` (TRUE/FALSE)
* `Methods_Other` (String, if any)
* `StudentsPresent` (Number)
* `TotalEnrolled` (Number)
* `ParticipationLevel` (High/Moderate/Low)
* `EngagementObservations`
* `ChallengesTrainer`
* `ChallengesStudent`
* `ActionPlan`
* `Feedback`
* `ReviewedBy`

### Tab 3: `WorkReports`
This sheet logs the daily tasks and time slots for trainers.
**Required Headers (Row 1):**
* `Timestamp` 
* `TrainerName`
* `Date` (Format: DD/MM/YYYY)
* `Department`
* `Batch`
* `KeyAccomplishments`
* `ChallengesSolutions`
* `PendingWork`
* `AdditionalNotes`
* `ReviewedBy`
* `TimeSlot_1_Time` (e.g., 08:30 - 09:30)
* `TimeSlot_1_Task`
* `TimeSlot_1_Status` (Completed/Pending)
* `TimeSlot_1_Remarks`
* *(Repeat the above 4 columns for TimeSlot_2 through TimeSlot_8 if you have 8 slots per day)*

---

## 2. Add Google Apps Script

We need to create an API endpoint that reads this Google Sheet and returns JSON data to your React app.

1. Open your Google Sheet.
2. Go to **Extensions > Apps Script**.
3. Delete the default `function myFunction() {}`.
4. Paste the following code:

```javascript
function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  
  var data = {
    members: getSheetData(sheet.getSheetByName("Members")),
    trainingReports: getTrainingReports(sheet.getSheetByName("TrainingReports")),
    workReports: formatWorkReports(sheet.getSheetByName("WorkReports"))
  };
  
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// Generic function to read simple sheets (like Members)
function getSheetData(sheet) {
  if (!sheet) return [];
  var rows = sheet.getDataRange().getValues();
  var headers = rows[0];
  var result = [];
  
  for (var i = 1; i < rows.length; i++) {
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      // Convert header to camelCase
      var key = headers[j].charAt(0).toLowerCase() + headers[j].slice(1);
      obj[key] = rows[i][j];
    }
    result.push(obj);
  }
  return result;
}

// Function handling the nested methods object for Training Reports
function getTrainingReports(sheet) {
  if (!sheet) return [];
  var rows = sheet.getDataRange().getValues();
  var headers = rows[0];
  var result = [];
  
  for (var i = 1; i < rows.length; i++) {
    var obj = { methods: {} };
    for (var j = 0; j < headers.length; j++) {
      var headerName = headers[j];
      var value = rows[i][j];
      
      if (headerName.startsWith('Methods_')) {
        var methodKey = headerName.replace('Methods_', '');
        methodKey = methodKey.charAt(0).toLowerCase() + methodKey.slice(1);
        // Ensure boolean conversion for the checkbox items
        if(methodKey !== 'other') {
           obj.methods[methodKey] = (value === true || value === 'TRUE' || value === 'true');
        } else {
           obj.methods[methodKey] = value;
        }
      } else {
        var key = headerName.charAt(0).toLowerCase() + headerName.slice(1);
        obj[key] = value;
      }
    }
    result.push(obj);
  }
  return result;
}

// Function handling the nested timeSlots array for Work Reports
function formatWorkReports(sheet) {
  if (!sheet) return [];
  var rows = sheet.getDataRange().getValues();
  var headers = rows[0];
  var result = [];
  
  for (var i = 1; i < rows.length; i++) {
    var obj = { timeSlots: [] };
    
    // Create empty slots to be populated
    var timeSlotObjMap = {}; 
    
    for (var j = 0; j < headers.length; j++) {
      var headerName = headers[j];
      var value = rows[i][j];
      
      if (headerName.startsWith('TimeSlot_')) {
        // e.g., TimeSlot_1_Task
        var parts = headerName.split('_'); 
        var index = parseInt(parts[1]) - 1; // 0-based index
        var field = parts[2].toLowerCase(); // time, task, status, or remarks
        
        if (!timeSlotObjMap[index]) {
          timeSlotObjMap[index] = { timeSlot: "", task: "", status: "", remarks: "" };
        }
        
        if (field === 'time') timeSlotObjMap[index].timeSlot = value;
        if (field === 'task') timeSlotObjMap[index].task = value;
        if (field === 'status') timeSlotObjMap[index].status = value;
        if (field === 'remarks') timeSlotObjMap[index].remarks = value;
        
      } else {
        var key = headerName.charAt(0).toLowerCase() + headerName.slice(1);
        obj[key] = value;
      }
    }
    
    // Convert map to array and filter out completely empty slots
    for (var k = 0; k < 8; k++) { // Assuming up to 8 slots
      if (timeSlotObjMap[k] && (timeSlotObjMap[k].task || timeSlotObjMap[k].timeSlot)) {
        obj.timeSlots.push(timeSlotObjMap[k]);
      }
    }
    
    result.push(obj);
  }
  return result;
}
```

---

## 3. Deploy the Apps Script as a Web App

To make the data accessible to your DashSheet app:

1. In the Apps Script editor, click the blue **Deploy** button at the top right.
2. Select **New deployment**.
3. Under **Select type** (click the gear icon ⚙️), choose **Web app**.
4. Set the following config:
   * **Description**: `DashSheet API v1` (or anything you like)
   * **Execute as**: `Me`
   * **Who has access**: `Anyone` (Crucial for the React app to read it without requiring users to log into Google first)
5. Click **Deploy**.
6. Google will ask for permissions to access your data. Click **Authorize access**, choose your account, click **Advanced**, and then go to the script (unsafe). 
7. Copy the **Web app URL** it provides (it starts with `https://script.google.com/macros/s/.../exec`).

---

## 4. Connect DashSheet

1. In your DashSheet project folder, create a file named `.env` at the root level (next to `package.json`).
2. Add the URL you copied from Apps Script to that file:

```env
VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_ACTUAL_SCRIPT_ID_HERE/exec
```

3. Restart your React development server if it is running (`Ctrl+C` then `npm run dev`).

That's it! Once you restart, the `sheetsApi.ts` file will automatically notice the `VITE_APPS_SCRIPT_URL` environment variable and switch from generating mock data to fetching real data from your Google Sheet.

### Need Data Entry Forms?
To get data *into* the Google Sheets, the easiest approach for your trainers is to create two **Google Forms** (one for Training Reports, one for Work Reports) and set their destination to be the Google Sheet you created above. You just need to ensure the columns map appropriately to the headers mentioned in step 1.

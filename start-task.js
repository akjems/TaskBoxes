// Start Basic is the quickest most reliable way to use Task Boxes.
// Based on which task you want to work on JXA opens reminders and directory
// A countdown is started and Apple Music plays

// Script does does the following
// 1. Opens Safari with a 25 minute countdown
// 2. Lists directory in ~/Documents/Task Boxes as a choices in a list
// 3. Asks to specify task you will be working on
// 4. Opens relevant directory, Reminder list
// 5. Starts Music

// Include standard Additions
const app = Application.currentApplication()
app.includeStandardAdditions = true

// Set vars for Apps used
const Finder = Application('Finder');
const Reminders = Application('Reminders');
const SystemEvents = Application('System Events')
const Music = Application('Music');


// Assigned variables from start
var homeDir = SystemEvents.currentUser.homeDirectory();
var currentUser = SystemEvents.currentUser.name();
var supportFiles = homeDir + "/Library/akjems/TaskBoxes"
var logFile = supportFiles + "/Basic.log"
var taskBoxesDir = homeDir + "/Documents/Task\ Boxes/"
writeToLog("Start Task launched", logFile, true)

app.openLocation("http://countdown-v1.akjems.com/")

var taskBoxChoices = listDirectory(taskBoxesDir)

// Alphabetize the list of folders that represent taskBoxes
taskBoxChoices.sort();

// Remove .DS_Store from the list of options
taskBoxChoices.splice(taskBoxChoices.indexOf('.DS_Store'), 1);

try {
	var taskBox = app.chooseFromList(taskBoxChoices, {
  	  withPrompt: "What are you working on? ",
  	  defaultItems: ["other"],
	  cancelButton: "Cancel"
	})
	} catch(err) {
		writeToLog("FAILED get Task Box selection", logFile, true)
	}

if (taskBox) {


    writeToLog("Received selection " + taskBox + "\n", logFile, true)

    // Prep to show Reminders so we know what there is to work on before specifically choosing
    if (Reminders.lists.byName(taskBox).exists()) {
        Reminders.lists.byName(taskBox).show();
    } else {
        // TODO ask and store if they want a list created
        var newReminderList = Reminders.List({
            name: taskBox
        });
        Reminders.lists.push(newReminderList);
        Reminders.lists.byName(taskBox).show()
    }
    try {
        Reminders.activate();
		clearVariable(Reminders)
    } catch (err) {
        writeToLog("ERROR open Reminders", logFile, true)
    }

    writeToLog("Activated Reminders", logFile, true)


    // Set directory that will be opened by finder
    var dirUsed = taskBoxesDir + taskBox
	writeToLog("dirUsed is" + dirUsed, logFile, true)
	// without Delay it prompt would not come up
	delay(2)
	// See guidedPrompt function at button

    // Exit script if cancelled
    // Result to be used in calendar event creation

    //Open Finder Location
    var strPath = $(dirUsed).stringByStandardizingPath.js
    Finder.reveal(Path(strPath));


        // Bring the wanted apps to the front
    Finder.activate();
    writeToLog("Activated finder", logFile, true)
	try{
		Music.play();
	} catch(err){
		writeToLog("FAILED to Play music", logFile, true)
		};


} else {
    writeToLog("User cancelled start", logFile, true)
}

// Prompt Function
function guidedPrompt(text) {
	var options = {defaultAnswer: taskBox + " - ",
            withIcon: "note",
            buttons: ["Cancel", "Continue"],
            defaultButton: "Continue"
        }
	try {
    	return app.displayDialog(text,options).textReturned
  } catch (e) {
    return null
  }
}


// Function to read in folder names contents for array
function listDirectory(strPath) {
    fm = fm || $.NSFileManager.defaultManager;

    return ObjC.unwrap(
            fm.contentsOfDirectoryAtPathError($(strPath)
                .stringByExpandingTildeInPath, null))
        .map(ObjC.unwrap);
}
var fm = $.NSFileManager.defaultManager;

// A single function to write to log with date, user, and event

function writeToLog(msg, file) {
    try {

        // Convert the file to a string
        var fileString = file.toString()

        // Open the file for writing
        var openedFile = app.openForAccess(Path(fileString), {
            writePermission: true
        })

        var d = new Date()
        isoDate = new Date(d.getTime() - (d.getTimezoneOffset() * 90000)).toISOString();
		logEntry = "\n" + isoDate + " " + currentUser + " " + msg + "\n"
              // Write the new content to the file
        app.write(logEntry, {
            to: openedFile,
            startingAt: app.getEof(openedFile)
        })

        // Close the file
        app.closeAccess(openedFile)

        // Return a boolean indicating that writing was successful
        return true
    } catch (error) {

        try {
            // Close the file
            app.closeAccess(file)
        } catch (error) {
            // Report the error is closing failed
            console.log(`Couldn't close file: ${error}`)
        }

        // Return a boolean indicating that writing was successful
        return false
    }
}

function myPath() {
    var app = Application.currentApplication(); app.includeStandardAdditions = true
    return $(app.pathTo(this).toString()).stringByDeletingLastPathComponent.js
}

function clearVariable(variable){
	variable = undefined
	delete(variable)
	}

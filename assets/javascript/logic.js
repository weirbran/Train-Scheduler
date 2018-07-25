$(document).ready(function() {
  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyAK4QoFOE3263vMnCR9qil3v8VCeH_XEmI",
    authDomain: "lrt-train-scheduler.firebaseapp.com",
    databaseURL: "https://lrt-train-scheduler.firebaseio.com",
    projectId: "lrt-train-scheduler",
    storageBucket: "lrt-train-scheduler.appspot.com",
    messagingSenderId: "151733595046"
  };
  firebase.initializeApp(config);

  //Variable used to reference the database
  var database = firebase.database();

  //Initial values
  var trainName = "";
  var destinationName = "";
  var firstTrainTime = "";
  var frequency = 0;
  var nextArrival = 0;
  var currentTime = moment().format("HH:mm");
  var minutesAway = 0;

  //Displays the current time for the user
  $("#currentTime").append(currentTime);

  //When the user clicks submit
  $("#submit").on("click", function(event) {
    //Prevents page from refreshing when submit button click
    event.preventDefault();

    //Grabs the input values from the text boxes
    trainName = $("#trainNameInput")
      .val()
      .trim();
    destinationName = $("#destinationNameInput")
      .val()
      .trim();
    firstTrainTime = $("#firstTrainTimeInput")
      .val()
      .trim();
    frequency = $("#frequencyInput")
      .val()
      .trim();

    if (frequency < 0 || firstTrainTime < 0) {
      alert("Frequency and First Train Time must have positive values");
    } else {
      //Pushes the user input values to the database
      database.ref().push({
        name: trainName,
        destination: destinationName,
        time: firstTrainTime,
        frequency: frequency,
        dateAdded: firebase.database.ServerValue.TIMESTAMP
      });
    }

    // Clears all of the text-boxes
    $(
      "#trainNameInput, #destinationNameInput, #firstTrainTimeInput, #frequencyInput"
    ).val("");
  });

  //Listen for changes to the database
  database.ref().on(
    "child_added",
    function(childSnapshot) {
      //Storing the childSnapshot.val() in a variable for convenience
      var trainData = childSnapshot.val();

      //Series of step to calculate the time of the next train arrival
      //Calculate difference in time between the current time and the first train time in UNIX, and convert to minutes
      var trainTimeDifference = moment().diff(
        moment.unix(trainData.time),
        "minutes"
      );

      //Get the remainder of time, i.e., how many times your frequency fits into the time difference, by using 'moderator' with the frequency & time difference
      //How many times the train is going to arrive in that period of time
      var timeRemaining = trainTimeDifference % trainData.frequency;

      //Subtract the timeRemaining from the frequency to determine how many minutes away the next train is
      minutesAway = trainData.frequency - timeRemaining;

      //Add minutesAway to now, to find next train & convert to military time
      nextArrival = moment()
        .add(minutesAway, "m")
        .format("HH:mm");

      //Print the user's input and the calculated values to the train schedule table
      $("#schedule").append(
        "<tr><td>" +
          trainData.name +
          "</td>" +
          "<td>" +
          trainData.destination +
          "</td>" +
          "<td>" +
          trainData.frequency +
          "</td>" +
          "<td>" +
          nextArrival +
          "</td>" +
          "<td>" +
          minutesAway +
          "</td></tr>"
      );
    },
    function(errorObject) {
      console.log("Errors handled: " + errorObject.code);
    }
  );

  //Refreshes the page every minute, so user can see minute-to-minute update of times
  setInterval("window.location.reload()", 60000);
});

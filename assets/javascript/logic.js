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

    //Pushes the user input values to the database
    database.ref().push({
      name: trainName,
      destination: destinationName,
      time: firstTrainTime,
      frequency: frequency,
      dateAdded: firebase.database.ServerValue.TIMESTAMP
    });

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

      //Calculate the time of the next train arrival
      //Calcutlate difference in time between current time and time of first train in UNIX, and convert to minutes
      var trainTimeDifference = moment().diff(
        moment.unix(trainData.time),
        "minutes"
      );

      //Get the remainder of time by using 'moderator' with the frequency & time difference
      var timeRemainder = trainTimeDifference % trainData.frequency;

      //Subtract the remainder from the frequency
      minutesAway = trainData.frequency - timeRemainder;

      //Add minutesAway to now, to find next train & convert to standard time format
      nextArrival = moment()
        .add(minutesAway, "m")
        .format("HH:mm");

      //Print the user's input to the train schedule table
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

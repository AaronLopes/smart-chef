const login = require("facebook-chat-api");
const Clarifai = require('clarifai');
const google = require('google');
google.resultsPerPage = 5;

const app = new Clarifai.App({
    apiKey: 'a51bfc07d6a44ddd8ffe0b463d5969ec'
});

var userDB = {};


function reminder(api,seconds, text, threadID){
  setTimeout(api.sendMessage, seconds * 1000, text, threadID );
}


// Create simple echo bot
login({ email: "alopes430@student.fuhsd.org", password: "Reolus@123" }, (err, api) => {
    if (err) return console.error(err);

    api.listen((err, event) => {

        switch (event.type) {
            case "message":

                if (event.body.toLowerCase() == "hello" || event.body.toLowerCase() == "hi" || event.body.toLowerCase() == "help") {
                    api.sendMessage("Hi, I'm SmartChef, a personal assistant to help you decide what to eat!\n" +
                        "To get a recipe, first send me 'new recipe'.\n" +
                        "Then, send me some pictures of ingredients you have in your house.\n" +
                        "If I'm unable to identify an ingredient from the picture, you can just " +
                        "enter the food ingredient as text. When you're done with the ingredients, " +
                        "just send me 'find recipe' and I'll find you the perfect meal.\n" +
                        "Happy Cooking!", event.threadID);
                    return;
                }

                if (!(event.threadID in userDB)) {
                    userDB[event.threadID] = { // remove+add user to db

                        items: []

                    };

                }

                if (event.body.trim() == "new recipe") { //if its a new user or a new recipe

                    userDB[event.threadID] = { // remove+add user to db

                        items: []

                    };
                    api.sendMessage("Creating a new recipe. Send pictures of ingredients or just ingredient names to add them to the ingredient list, and send 'find recipe' ", event.threadID);
                    return;
                }

                if (event.body == "list") {
                    if (userDB[event.threadID].items.length == 0) {
                        api.sendMessage("You haven't added any ingredients yet!", event.threadID);
                    }
                    var list = "Your Ingredients:\n";
                    for (var i = 0; i < userDB[event.threadID].items.length; i++) {
                        list += userDB[event.threadID].items[i] + "\n";
                    }
                    api.sendMessage(list, event.threadID);
                    return;
                }


                if (event.attachments.length > 0 && (event.attachments[0].type == "photo" || event.attachments[0].type == "animated_image")) {
                    var testImageURL = event.attachments[0].url;
                    var foodID = "bd367be194cf45149e75f01d59f77ba7";
                    app.models.predict("bd367be194cf45149e75f01d59f77ba7", testImageURL).then(
                        function(response) {
                            var tag = response.outputs[0].data.concepts[0].name;
                            console.log(tag);

                            userDB[event.threadID].items.push(tag);
                            api.sendMessage("Added " + tag + " to your ingredients list.", event.threadID);

                            return;

                        },
                        function(err) {
                            console.log(err);
                        }
                    );
                }

                if (event.body.toLowerCase().includes("thanks") || event.body.toLowerCase().includes("thank you")) {
                    api.sendMessage("No problemo! Feast well my meatbag friend!", event.threadID);
                    return;
                }

                if (event.body.toLowerCase().trim().includes("find recipe")) {
                    api.sendMessage("Cooking Apple, Orange and Banana Smoothie", event.threadID);
                    var instruction = ["1. Peel the orange and remove as much of the white pith as possible with a sharp knife. Chop the orange into small rough chunks, discarding any pips.",
                        "2. Peel the banana and chop into slices.",
                        "3. Peel the apple with a knife or a swivel peeler. Chop the apple into small chunks and discard the core and pips.",
                        "4. Put all of the fruit, orange juice and ice (optional) into the blender. Blend for 20 seconds or until smooth."
                    ]
                    for (i = 0; i < 4; i++) {
                        reminder(api, 5 * i + 5, instruction[i], event.threadID);
                    }
                    reminder(api, 21, "Setting timer for 20 seconds.", event.threadID);
                    reminder(api, 41, "Times up!", event.threadID);
                    return;
                }

            case "event":
                break;
        }


    });
});
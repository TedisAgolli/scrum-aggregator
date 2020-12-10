// Require the Bolt package (github.com/slackapi/bolt)
const { App } = require("@slack/bolt");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

// All the room in the world for your code

// Store conversation history
let conversationHistory;

// Fetch conversation history using ID from last example
async function fetchHistory(id, user_id) {
  try {
    // Call the conversations.history method using the built-in WebClient
    const result = await app.client.conversations.history({
      // The token you used to initialize your app
      token: process.env.SLACK_BOT_TOKEN,
      channel: id,
    });

    conversationHistory = result.messages;

    console.log(conversationHistory);
    return conversationHistory
      .filter((msg) => msg.user === user_id)
      .map((x) => x.text)
      .join("\n");
    // Print results
    // console.log(conversationHistory);
    // console.log(conversationHistory.length + " messages found in " + id);
  } catch (error) {
    console.error(error);
  }
}

async function findConversation(name) {
  try {
    // Call the conversations.list method using the built-in WebClient
    const result = await app.client.conversations.list({
      // The token you used to initialize your app
      token: process.env.SLACK_BOT_TOKEN,
    });

    for (const channel of result.channels) {
      if (channel.name === name) {
        // Print result
        console.log("Found conversation ID: " + channel.id);
        // Break from for loop
        break;
      }
    }
  } catch (error) {
    console.error(error);
  }
}

app.command("/helloworld", async ({ ack, payload, context }) => {
  // Acknowledge the command request
  ack();
  // findConversation("apptest");

  const fromTed = await fetchHistory("C01H9B41R32", payload.user_id);
  // console.log(payload);
  try {
    const result = await app.client.chat.postMessage({
      token: context.botToken,
      // Channel to send message to
      channel: payload.channel_id,
      // Include a button in the message (or whatever blocks you want!)
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: fromTed,
          },
          accessory: {
            type: "button",
            text: {
              type: "plain_text",
              text: "Click me!",
            },
            action_id: "button_abc",
          },
        },
      ],
      // Text in the notification
      text: "Message from Test App",
    });
    console.log(result);
  } catch (error) {
    console.error(error.data);
  }
});

app.event("app_home_opened", async ({ event, client, context }) => {
  try {
    /* view.publish is the method that your app uses to push a view to the Home tab */
    const result = await client.views.publish({
      /* the user that opened your app's app home */
      user_id: event.user,

      /* the view object that appears in the app home*/
      view: {
        type: "home",
        callback_id: "home_view",

        /* body of the view */
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "*Welcome to your _App's Home_* :tada:",
            },
          },
          {
            type: "divider",
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text:
                "This button won't do much for now but you can set up a listener for it using the `actions()` method and passing its unique `action_id`. See an example in the `examples` folder within your Bolt app.",
            },
          },
          {
            type: "actions",
            elements: [
              {
                type: "button",
                text: {
                  type: "plain_text",
                  text: "Click me!",
                },
              },
            ],
          },
        ],
      },
    });
  } catch (error) {
    console.error(error);
  }
});

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log("⚡️ Bolt app is running!");
})();

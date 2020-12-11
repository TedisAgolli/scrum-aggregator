// Require the Bolt package (github.com/slackapi/bolt)
const dotenv = require("dotenv");
dotenv.config();
const { App } = require("@slack/bolt");

const HOME_BLOCKS = [
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: "Select your scrum channel",
    },
    accessory: {
      type: "multi_conversations_select",
      placeholder: {
        type: "plain_text",
        text: "Select conversations",
        emoji: true,
      },
      action_id: "select_scrum_channel",
    },
  },
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: "Start date",
    },
    accessory: {
      type: "datepicker",
      initial_date: "1990-04-28",
      placeholder: {
        type: "plain_text",
        text: "Select a date",
        emoji: true,
      },
      action_id: "datepicker_start",
    },
  },
  {
    type: "section",
    text: {
      type: "mrkdwn",
      text: "End date.",
    },
    accessory: {
      type: "datepicker",
      initial_date: "1990-04-28",
      placeholder: {
        type: "plain_text",
        text: "Select a date",
        emoji: true,
      },
      action_id: "datepicker_end",
    },
  },
  {
    type: "actions",
    elements: [
      {
        type: "button",
        text: {
          type: "plain_text",
          text: "Get updates",
          emoji: true,
        },
        action_id: "button_list_updates",
        value: "button_list_updates",
      },
    ],
  },
];
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

// All the room in the world for your code

// Fetch conversation history using ID from last example
async function fetchHistory(id, user_id) {
  try {
    // Call the conversations.history method using the built-in WebClient
    const result = await app.client.conversations.history({
      // The token you used to initialize your app
      token: process.env.SLACK_BOT_TOKEN,
      channel: id,
    });
    return result.messages
      .filter((msg) => msg.user === user_id)
      .map((x) => x.text)
      .join("\n");
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

app.action("datepicker_start", async ({ ack, client, body }) => {
  ack();
  console.log(body);
});

app.action("button_list_updates", async ({ ack, client, body, context }) => {
  ack();
  const fromTed = await fetchHistory("C01H9B41R32", body.user.id);
  const updates = {
    type: "section",
    text: {
      type: "mrkdwn",
      text: fromTed,
    },
  };
  try {
    const result = await client.views.publish({
      /* the user that opened your app's app home */
      user_id: body.user.id,
      /* the view object that appears in the app home*/
      view: {
        type: "home",
        callback_id: "home_view",
        /* body of the view */
        blocks: [...HOME_BLOCKS, updates],
      },
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
        blocks: HOME_BLOCKS,
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

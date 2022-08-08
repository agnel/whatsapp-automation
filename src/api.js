const express = require('express');
const serverless = require('serverless-http');
const body_parser = require('body-parser');
const axios = require('axios');
require('dotenv').config();

const app = express().use(body_parser.json());
const router = express.Router();

const token = process.env.TOKEN;
const mytoken = process.env.MYTOKEN; //abhishek_token

router.get('/', (req, res) => {
  res.json({
    hello: 'hi!',
  });
});

router.get('/webhook', (req, res) => {
  let data = req.body;
  let mode = data.hub.mode;
  let challange = data.hub.challenge;
  let token = data.hub.verify_token;

  if (mode && token) {
    if (mode === 'subscribe' && token === mytoken) {
      res.status(200).send(challange);
    } else {
      res.status(403);
    }
  }
});

router.post('/webhook', (req, res) => {
  //i want some

  let body_param = req.body;

  console.log(JSON.stringify(body_param, null, 2));

  if (body_param.object) {
    console.log('inside body param');
    if (
      body_param.entry &&
      body_param.entry[0].changes &&
      body_param.entry[0].changes[0].value.messages &&
      body_param.entry[0].changes[0].value.messages[0]
    ) {
      let phon_no_id =
        body_param.entry[0].changes[0].value.metadata.phone_number_id;
      let from = body_param.entry[0].changes[0].value.messages[0].from;
      let msg_body = body_param.entry[0].changes[0].value.messages[0].text.body;

      console.log('phone number ' + phon_no_id);
      console.log('from ' + from);
      console.log('boady param ' + msg_body);

      axios({
        method: 'POST',
        url:
          'https://graph.facebook.com/v13.0/' +
          phon_no_id +
          '/messages?access_token=' +
          token,
        data: {
          messaging_product: 'whatsapp',
          to: from,
          text: {
            body: "Thank you for responding. We'll get back to you shortly. Hare Krishna.",
          },
        },
        headers: {
          'Content-Type': 'application/json',
        },
      });

      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
  }
});

app.use(`/.netlify/functions/api`, router);

module.exports = app;
module.exports.handler = serverless(app);

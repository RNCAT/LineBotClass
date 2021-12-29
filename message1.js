require('dotenv').config();
const express = require('express');
const axios = require('axios').default;
const line = require('@line/bot-sdk');

const WEATHER_API_URL = 'https://data.tmd.go.th/nwpapi/v1/forecast/location/daily/place';
const WEATHER_TOKEN = process.env.WEATHER_ACCESS_TOKEN;
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};
const PORT = process.env.NODE_PORT || 3000;

const app = express();
const client = new line.Client(config);

async function getWeather() {
  try {
    const weather = await axios.get(WEATHER_API_URL, {
      params: {
        province: 'สงขลา',
        amphoe: 'เมืองสงขลา',
        tambon: 'เขารูปช้าง',
      },
      headers: {
        Authorization: `Bearer ${WEATHER_TOKEN}`,
      },
    });

    const weatherConds = {
      1: 'ท้องฟ้าแจ่มใส',
      2: 'มีเมฆบางส่วน',
      3: 'เมฆเป็นส่วนมาก',
      4: 'มีเมฆมาก',
      5: 'ฝนตกเล็กน้อย',
      6: 'ฝนปานกลาง',
      7: 'ฝนตกหนัก',
      8: 'ฝนฟ้าคะนอง',
      9: 'อากาศหนาวจัด',
      10: 'อากาศหนาว',
      11: 'อากาศเย็น',
      12: 'อากาศร้อนจัด',
    };

    const { WeatherForecasts } = weather.data;
    const weatherResult = WeatherForecasts[0].forecasts[0];
    const weatherTime = new Date(weatherResult.time).toLocaleDateString();

    const weatherString = `อุณหภูมิ: ${weatherResult.data.tc} °C \
                            ความชื้นสัมพัทธ์: ${weatherResult.data.rh} % \
                            สภาพอากาศ: ${weatherConds[weatherResult.data.cond]}
                            \nข้อมูลวันที่: ${weatherTime}`;

    return weatherString;
  } catch (error) {
    return console.error(error.response.data);
  }
}

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.get('/', (req, res) => res.sendStatus(200));

app.post('/', (req, res) => res.sendStatus(200));

app.post('/webhook', async (req, res) => {
  if (!req.body.events.length) return res.sendStatus(200);

  console.log(req.body.events[0].source.userId);

  const messageList = {
    text: { type: 'text', text: 'หลักสูตรวิทยาการคอมพิวเตอร์\nยินดีต้อนรับ' },
    location: {
      type: 'location',
      title: 'SKRU',
      address: 'ถนน สำโรง ตำบล เขารูปช้าง อำเภอเมืองสงขลา สงขลา 90000',
      latitude: 7.172211991730995,
      longitude: 100.61377561534297,
    },
    weather: { type: 'text', text: await getWeather() },
    menu: {
      type: 'imagemap',
      baseUrl: 'https://i.imgur.com/aQIJsXo.jpg?itis=bug',
      altText: 'This is an imagemap',
      baseSize: {
        width: 1040,
        height: 351,
      },
      actions: [
        {
          type: 'message',
          area: {
            x: 343,
            y: 5,
            width: 697,
            height: 346,
          },
          text: 'Register',
        },
        {
          type: 'message',
          area: {
            x: 3,
            y: 3,
            width: 340,
            height: 348,
          },
          text: 'Information',
        },
      ],
    },
    default: { type: 'text', text: 'อัลปาก้าไม่เข้าใจ ???' },
  };

  const { replyToken, type, message, source } = req.body.events[0];

  if (type === 'message') {
    let msg;

    switch (message.text) {
      case 'สวัสดี':
        msg = messageList.text;
        break;
      case 'อยู่ที่ไหน':
        msg = messageList.location;
        break;
      case 'พยากรณ์อากาศ':
        msg = messageList.weather;
        break;
      case 'เมนู':
        msg = messageList.menu;
        break;
      case 'โปรไฟล์':
        // eslint-disable-next-line no-case-declarations
        const profile = await client.getProfile(source.userId);

        msg = [
          { type: 'text', text: profile.displayName },
          {
            type: 'image',
            originalContentUrl: profile.pictureUrl,
            previewImageUrl: profile.pictureUrl,
          },
          {
            type: 'text',
            text: profile.statusMessage ? profile.statusMessage : 'ไม่มีสถานะ',
          },
        ];
        break;
      default:
        msg = messageList.default;
    }

    await client.replyMessage(replyToken, msg);
  }

  return res.sendStatus(200);
});

app.post('/push', async (req, res) => {
  const { userId, text } = req.body;

  await client.pushMessage(userId, { type: 'text', text: `${text} from SDK` });

  return res.sendStatus(200);
});

app.listen(PORT, () => console.log(`server is running on http://localhost:${PORT}`));

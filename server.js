const http = require('http');
const express = require('express');
const morgan = require('morgan');
const cors = require("cors");
const path = require('path');
const session = require("express-session");
const app = express();
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload')
const cookieSession = require('cookie-session');
const passportSetup = require("./passport");
const bodyParser = require('body-parser');

const passport = require('passport');
const createError = require('http-errors');
const { SerialPort } = require('serialport');
const io = require('socket.io')(http);



app.use(morgan('dev'));
app.use(cookieParser())
// app.use(fileUpload({
//   useTempFiles: true
// }))

// Handeling CORS
app.use(
  cors({
    // origin: "http://localhost:3000",
    // origin: "http://localhost:8081",
    // methods: "GET,POST,PUT,DELETE",
    // credentials: true,
  })
);
const { Configuration, OpenAIApi } = require("openai");
require('dotenv').config()

const configuration = new Configuration({
  apiKey:"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",
});
const openai = new OpenAIApi(configuration);

async function runCompletion (text) {
  const completion = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: text,
    max_tokens: 150,
    n: 1,
    stop: '\n'
  });
  return completion.data.choices[0].text.trim();
}

app.get('/generateText', async (req, res) => {
  try {
    const prompt = req.query.prompt;
    let generatedText = '';
    for (let i = 0; i < 5; i++) {
      const response = await runCompletion(prompt + generatedText);
      generatedText += '\n' + response;
    }
    res.send(generatedText.trim());
  } catch (error) {
    console.error(error);
    res.status(500).send('Error generating text');
  }
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.get("/", (req, res) => {
res.json({ message: "Welcome to agricom." });
});
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
console.log(`Server is running on port ${PORT}.`);
});

app.use(express.static(path.join(__dirname, 'uploads')));
app.get('/uploads/:id', (req, res) => {
res.sendFile(path.join(__dirname, `./uploads/${req.params.id}`));
});

const db = require("./app/models");
const dbConfig = require("./app/config/db.config");
const Role = db.role;
db.mongoose.set("strictQuery", false);
db.mongoose .connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
useNewUrlParser: true,
useUnifiedTopology: true
})
.then(() => {
console.log("Successfully connect to MongoDB.");
initial();
})
.catch(err => {
console.error("Connection error", err);
process.exit();
});
// Initialise the auth

app.use(passport.initialize());
app.use(passport.session());

  // Initialise a session
app.use(
  cookieSession({ name: "session", keys: ["lama"], maxAge: 24 * 60 * 60 * 100 })
);

// register regenerate & save after the cookieSession middleware initialization
app.use(function(request, response, next) {
    if (request.session && !request.session.regenerate) {
        request.session.regenerate = (cb) => {
            cb()
        }
    }
    if (request.session && !request.session.save) {
        request.session.save = (cb) => {
            cb()
        }
    }
    next()
})

// Connecting to the routes
const authRoute = require('./app/routes/google.routes');
const Temp = require('./app/models/TempModel');
const HumidityS = require('./app/models/HumiditySol');
const Pump = require('./app/models/PumpModel');
const HumidityNormal = require('./app/models/HumidityNormal');
const StatJour = require('./app/models/StatJour');
app.use('/auth', authRoute)

function initial() {
Role.count((err, count) => {
if (!err && count === 0) {
  new Role({
    name: "user"
  }).save(err => {
    if (err) {
      console.log("error", err);
    }

    console.log("added 'user' to roles collection");
  });

  new Role({
    name: "moderator"
  }).save(err => {
    if (err) {
      console.log("error", err);
    }

    console.log("added 'moderator' to roles collection");
  });

  new Role({
    name: "admin"
  }).save(err => {
    if (err) {
      console.log("error", err);
    }

    console.log("added 'admin' to roles collection");
  });
}
});
}
require('./app/routes/user.routes')(app);
require('./app/routes/auth.routes')(app);
app.use('/api', require('./app/routes/upload'))

app.use('/api', require('./app/routes/categoryRouter'))

app.use('/api', require('./app/routes/productRouter'))
app.use('/api', require('./app/routes/codePromoRouter'))

// SerialPort.list().then((ports) => {
//   var port = new SerialPort({...ports[0],  baudRate: 9600});
//   setTimeout(() => {
//     port.on('data', (data) => {
//       console.log("Data :" , data.toString())
//     });
//   }, "10000");
  

// });
// io.on('connection', (socket) => {
//   console.log('a user connected');

//   // Send data to the client every second
//   setInterval(() => {
//     // Replace this with your actual code for reading data from the Arduino board
//     const data = Math.floor(Math.random() * 100);

//     socket.emit('data', data);
//   }, 1000);
// });
////////////////////////////////////////////////




// SerialPort.list().then((ports) => {
//   var port = new SerialPort({...ports[0],  baudRate: 9600});
//   let buffer = "";

//   port.on('data', async (data) => {
//     // Concatenate the incoming data
//     buffer += data.toString();

//     // Check if we have received a complete message
//     if (buffer.includes("\n")) {
//       // Remove the newline character
//       buffer = buffer.replace("\n", "");

// ///////////////////////////
// const values = buffer.split(",");


//       // Display the message in the desired format
//       console.log(values);
//       var datHeure = new Date();
//       var pumpTime= parseFloat(values[0])
//       const pump = await Pump.find()
//       console.log(pump)
//       if(pump[0].temp<pumpTime){
//         pump[0].temp=pumpTime
//       }else{
//         pump[0].temp=pump[0].temp+pumpTime
//       }
//       pump[0].save()
      
//       var humidite = values[1]; 
//       var temperature = values[2];
//       var humSol = values[3].slice(0,values[3].length-1)
//       console.log("hum"+humidite)
//       console.log("temp"+temperature)
//       console.log("humSol"+humSol)
//       console.log("pump"+pumpTime)  
     
//       const temp=parseFloat(values[2])
//       const HumS=parseFloat(humSol)
//       const h = await HumidityNormal.find().sort({ date: -1 })
//         const t = await Temp.find().sort({ date: -1 })
//         const hs= await HumidityS.find().sort({ date: -1 })
//         const stat= await StatJour.find()
//         //console.log(h)
//         if (t.length>=24){
//           let hum=0
//           let tem=0
//           let humS=0
//           let pop=pump[0].temp
//           h.map((hu)=>{
//             hum =+ hu.humidity
//           })
//           t.map((te)=>{
//             tem =+ te.temp
//           })
//           hs.map((hS)=>{
//            humS=+ hS.humidity           
//           })
//           stat.map((s)=>{
//             pop = pop - s.tempPoump
//           })
//           console.log("a" +pump[0].temp)
//           console.log("aaa0" +pop)
//           const newStat = new StatJour({
//             temp: tem/24,
//             humidityN: hum/24,
//             humidityS: humS/24,
//             tempPoump:pop,
//             date:datHeure 
//           })
//           newStat.save()  

        
//           await Temp.deleteMany({})
//           await HumidityNormal.deleteMany({})
//           await HumidityS.deleteMany({})
        
//         }
//       if (humidite=="nan"){
        
//         const newHum = new HumidityNormal({
//           humidity : h[0].humidity , 
//           date : datHeure
  
//         })
//         const newTemp = new Temp({
//           temp:t[0].temp,
//           date:datHeure})
//           console.log(newTemp)  
//           const newHumS = new HumidityS({
//             humidity:HumS,
//             date:datHeure})
//             console.log(newHumS)
//           if(newTemp.date.getMinutes()==00)
//           {
//             newHum.save();
//             newTemp.save();
//             newHumS.save()
//             console.log("saved")
//           }
//           // Reset the buffer
//           buffer = "";
//       } else{
        
//       const newHum = new HumidityNormal({
//         humidity : humidite , 
//         date : datHeure
   
//       })
//       const newTemp = new Temp({
//         temp:temp,
//         date:datHeure})
//         console.log(newTemp)  
//       const newHumS = new HumidityS({
//         humidity:HumS,
//         date:datHeure})
//         console.log(newHumS)
//       if(newTemp.date.getMinutes()==00)
//       {
//         newHum.save();
//         newTemp.save();
//         newHumS.save()
//         console.log("saved")
//       }
//       // Reset the buffer
//       buffer = "";
//       }
//     }
//   });
// });

// io.on('connection', (socket) => {
//   console.log('a user connected');

//   // Send data to the client every second
//   setInterval(() => {
//     // Replace this with your actual code for reading data from the Arduino board
//     const data = Math.floor(Math.random() * 100);

//     socket.emit('data', data);
//   }, 1000);
// });

app.get('/getTemps', async (req, res) => {
  try {
    const temps = await Temp.find().sort({ date: 1 })
    res.json(temps)
} catch (err) {
    return res.status(500).json({msg: err.message})
}
});
app.get('/getHumS', async (req, res) => {
  try {
    const hum = await HumidityS.find().sort({ date: 1 })
    res.json(hum)
} catch (err) {
    return res.status(500).json({msg: err.message})
}
});
app.get('/getPump', async (req, res) => {
  try {
    const pump = await Pump.find()
    res.json(pump[0])
} catch (err) {
    return res.status(500).json({msg: err.message})
}
});
app.get('/getHumN', async (req, res) => {
  try {
    // const pump = await Pump.find()
    // res.json(pump[0])
    const hum = await HumidityNormal.find().sort({ date: 1 })
    res.json(hum)
} catch (err) {
    return res.status(500).json({msg: err.message})
}
});

app.get('/getStatJ', async (req, res) => {
  try {
    const stat = await StatJour.find().sort({ date: 1 })
    res.json(stat)
} catch (err) {
    return res.status(500).json({msg: err.message})
}
});

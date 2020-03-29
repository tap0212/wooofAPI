require('dotenv').config();
const express = require("express")
const mongoose = require("mongoose")

const app = express();

const bodyParser = require("body-parser")
const cookieParser  = require("cookie-parser")
const cors = require("cors")

//routes
const authRoutes = require("./routes/authentiction")
const userRoutes = require("./routes/user")
//DB connection
mongoose
    .connect(
        process.env.DATABASE,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex:true,
            useFindAndModify: false
        }
    )
    .then(() => console.log("DB Connected"))
    .catch(err => console.log(err));
//middleware
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());

//routes
app.use("/api",authRoutes);
app.use("/api",userRoutes)
//port
const port = process.env.PORT || 3000;
//server
app.listen(port,() => {
    console.log(`app is running at ${port}`);
})    
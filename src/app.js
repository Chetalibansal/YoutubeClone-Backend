import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}))

app.use(express.json({limit: "16kb"})) 
 //This is to limit the size of the request body from Json to 16kb
app.use(express.urlencoded({extended:true, limit: "16kb"}))
//whenever we get req from url so to check space or any symbols and it handles the data from form and then send the data 
app.use(express.static('public'))
//This is to serve static files from the public directory such as images, CSS files, and JavaScript files.
app.use(cookieParser())
export  {app}
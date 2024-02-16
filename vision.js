const express =require("express");// express 
app =express();

const { GoogleGenerativeAI } = require("@google/generative-ai");

const fs = require("fs");// to read files 
const path = require("path");

const webcam = require("node-webcam");// to access webcam
require("dotenv").config();//to access api ke from .env file
const say =require("say");// for text to audio response .
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const { Console } = require("console");

app.use(express.static(__dirname));// to use static file
function speec(text){
  return (
      new Promise((resolve,reject)=>{
        
         say.speak(text);
         resolve();
      }
      )
  )
}
function fileToGenerativePart(path, mimeType) {
    return {
      inlineData: {
        
          data: Buffer.from(fs.readFileSync(path)).toString("base64"),
        mimeType,
      },
    };
  }
  function ekam(imageFilePath, webcamOptions) {
  return new Promise((resolve, reject) => {
    
    webcam.capture(imageFilePath, webcamOptions, (err, data) => {
      if (err) {
       
        reject(err);
      } else {
        
        resolve(data);
      }
    });
  });
}

function rat(imageFilePath){
    return new Promise((resolve, reject) => {
      const generativePart = fileToGenerativePart(imageFilePath, "image/jpeg");
      
      resolve([generativePart]); // Wrap the part in an array
    });
  }
  

app.get("/",(req,res)=>{

  res.sendFile(__dirname+"/vision.html");// to send html file to homepage.
  
})

app.get("/rat",(req,res)=>{
  res.setHeader("Content-Type", "text/plain;charset=utf-8");
  async function captureAndUploadImage() {
    let imageFilePath = `./${Date.now()}.jpeg`;//to save image everytime with distinct name
  
    let webcamOptions = {
      width: 50,
      height: 50,
      quality: 100,
      saveShots: true,
      output: "jpeg",
      callbackReturn: "location",
    };
  await ekam(imageFilePath, webcamOptions);
      const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

      const prompt = " explain this image to a blind person along with approx distance and  instead of camera use word 'you' .do not use word image in response   ";

      const imageParts = await rat(imageFilePath);

      const result = await model.generateContentStream([prompt, ...imageParts]);

say.stop();// to stop audio response.

const response = await result.response;

const text = response.text();

console.log(text);

await speec(text);


fs.unlinkSync(imageFilePath);
    
     captureAndUploadImage();
  }
  
  captureAndUploadImage();
})
app.listen(process.env.PORT||3000,()=>{

  console.log("server running at localhost:8000");
});



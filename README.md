# TwitterBackend  
Prerequisites: Node.js and npm  
Also run the following npm command to install the following dependencies (some are already included in this repo):  
```
npm install express
npm install typescript ts-node nodemon @types/node @types/express --save-dev
npm install prisma --save-dev
npm install jsonwebtoken @types/jsonwebtoken --save-dev
npm install @aws-sdk/client-ses
```  
Or you can simply run the follwing command to install all the dependencies:  
```
npm i
```  
To start the backend server, navigate to the root folder and run the command below:  
```
npx ts-node src/index.ts
```  
To check the prisma (sqlite) database, navigate to the root folder and run the command below:  
```
npx prisma studio
```  
You can use the VScode extension Thunder Client to test this RESTful API.

# Prerequisite 
Install Node.js and npm. Follow [instruction](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

Set up a local MongoDB database. Follow [Instruction](https://www.prisma.io/dataguide/mongodb/setting-up-a-local-mongodb-database) or CSE316 instructions. 

# Local Setup 
1. Install npm modules 
```
npm install
```

2. Create and start a MongoDB database named `cse416-FantasyDraftingTool` 

3. create an .env file with
```
API_KEY="your-api-key-for-player-stats-api"
```

3. Start a development server
```
npm start
```

# Deployment 
The app is deployed through render and can be accessed at https://fantasydraftingtool.onrender.com/

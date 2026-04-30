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
JWT_SECRET="jwt-key"
```

3. Start a development server
```
npm start
```
# Endpionts
## Draft the Players from the csv File
**Endpoint:** `POST /TBD`
**Request (Windows cmd):**

```bash
curl -X POST "TBD" ^
  -H "Content-Type: application/json" ^
  --data @"path-to-draft-data"
```
<br>
The following fields are required: <br>
path-to-draft-data: please see draftPlayers.json for formatting <br>
playerID can be found from player_id_map.json


# Deployment 
The app is deployed through render and can be accessed at https://fantasydraftingtool.onrender.com/

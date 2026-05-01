const request = require("supertest");
const { app } = require("../server");
const mongoose = require("mongoose");
const DraftHistory = require("../models/DraftHistorySchema");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;
const testLeagueId = new mongoose.Types.ObjectId();

beforeAll(async () => {
  await mongoose.disconnect();
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

beforeEach(async () => {
  await DraftHistory.create({
    LeagueName: "Test League",
    Year: 2024,
    League: testLeagueId,
    OldPlayers: [],
    DraftedPlayers: [],
    Trades: []
  });
});

afterEach(async () => {
  await DraftHistory.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});
//check player has been added to draft history 
describe("POST /draftHistory/addPlayer", () => {
  it("should add a player to draft history", async () => {
    const res = await request(app)
      .post("/draftHistory/addPlayer")
      .send({
        leagueId: testLeagueId,
        year: 2024,
        playerName: "Mike Trout",
        teamName: "Team A",
        cost: 30,
        broughtupby: "Team A",
        position: "OF",
        playerID: 123
      });
    expect(res.status).toBe(200);
    expect(res.body.history.DraftedPlayers.length).toBe(1);
    expect(res.body.history.DraftedPlayers[0].PlayerName).toBe("Mike Trout");
  });

  it("assign pick number correctly", async () => {
    await request(app)
      .post("/draftHistory/addPlayer")
      .send({
        leagueId: testLeagueId,
        year: 2024,
        playerName: "Player One",
        teamName: "Team A",
        cost: 10,
        position: "SP",
      });
    const res = await request(app)
      .post("/draftHistory/addPlayer")
      .send({
        leagueId: testLeagueId,
        year: 2024,
        playerName: "Player Two",
        teamName: "Team B",
        cost: 20,
        position: "OF",
      });
    expect(res.status).toBe(200);
    expect(res.body.history.DraftedPlayers[1].Pick).toBe(2);
  });

  it("return 404 if league not found", async () => {
    const res = await request(app)
      .post("/draftHistory/addPlayer")
      .send({
        leagueId: new mongoose.Types.ObjectId(),
        playerName: "Test Player",
        cost: 10,
        position: "C"
      });
    expect(res.status).toBe(404);
  });
});

//can retrieve the draft history for a valid league
describe("POST /draftHistory/league", () => {
  it("should return draft history for a league", async () => {
    const res = await request(app)
      .post("/draftHistory/league")
      .send({ leagueId: testLeagueId });
    expect(res.status).toBe(200);
    expect(res.body.League).toBe(testLeagueId.toString());
  });

  it("should return 404 if league not found", async () => {
    const res = await request(app)
      .post("/draftHistory/league")
      .send({ leagueId: new mongoose.Types.ObjectId() });
    expect(res.status).toBe(404);
  });
});

describe("GET /draftHistory/trades/:leagueId", () => {
//starts with an empty trades array
  it("should return empty trades array initially", async () => {
    const res = await request(app)
      .get(`/draftHistory/trades/${testLeagueId}`);
    expect(res.status).toBe(200);
    expect(res.body.trades).toEqual([]);
  });
// inserts a trade into the database then confirms it comes back correctly
  it("should return trades if they exist", async () => {
    await DraftHistory.findOneAndUpdate(
      { League: testLeagueId },
      { $push: { Trades: {
        fromTeamName: "Team A",
        toTeamName: "Team B",
        fromPlayerName: "Mike Trout",
        toPlayerName: "Aaron Judge"
      }}}
    );
    const res = await request(app)
      .get(`/draftHistory/trades/${testLeagueId}`);
    expect(res.status).toBe(200);
    expect(res.body.trades.length).toBe(1);
    expect(res.body.trades[0].fromPlayerName).toBe("Mike Trout");
  });

  it("return 404 if league not found", async () => {
    const res = await request(app)
      .get(`/draftHistory/trades/${new mongoose.Types.ObjectId()}`);
    expect(res.status).toBe(404);
  });
});
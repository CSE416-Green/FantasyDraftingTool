const request = require("supertest");
const { app } = require("../server");
const mongoose = require("mongoose");
const AddedPlayer = require("../models/AddedPlayerSchema");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;
const testLeagueId = "testleague";

beforeAll(async () => {
  await mongoose.disconnect();
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterEach(async () => {
  await AddedPlayer.deleteMany({ leagueId: testLeagueId });
  await AddedPlayer.deleteMany({ leagueId: "otherleague" });
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe("POST /addedPlayerPool/add", () => {
  it("should add a player to the pool", async () => {
    const res = await request(app)
      .post("/addedPlayerPool/add")
      .send({ name: "Test Player", position: "OF", team: "New York Yankees", leagueId: testLeagueId });
    expect(res.status).toBe(200);
    expect(res.body.player.name).toBe("Test Player");
    expect(res.body.player.position).toBe("OF");
    expect(res.body.player.leagueId).toBe(testLeagueId);
  });

  it("should return 400 if name is missing", async () => {
    const res = await request(app)
      .post("/addedPlayerPool/add")
      .send({ position: "OF", leagueId: testLeagueId });
    expect(res.status).toBe(400);
  });

  it("should return 400 if position is missing", async () => {
    const res = await request(app)
      .post("/addedPlayerPool/add")
      .send({ name: "Test Player", leagueId: testLeagueId });
    expect(res.status).toBe(400);
  });

  it("should return 400 if leagueId is missing", async () => {
    const res = await request(app)
      .post("/addedPlayerPool/add")
      .send({ name: "Test Player", position: "OF" });
    expect(res.status).toBe(400);
  });
});

describe("GET /addedPlayerPool/manualPlayers/:leagueId", () => {
  it("should return players for a specific league", async () => {
    await request(app)
      .post("/addedPlayerPool/add")
      .send({ name: "Test Player", position: "OF", team: "New York Yankees", leagueId: testLeagueId });
    const res = await request(app)
      .get(`/addedPlayerPool/manualPlayers/${testLeagueId}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toBe("Test Player");
  });

  it("should return empty array if no players", async () => {
    const res = await request(app)
      .get("/addedPlayerPool/manualPlayers/noleague");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("should only return players for that specific league", async () => {
    await request(app)
      .post("/addedPlayerPool/add")
      .send({ name: "Player A", position: "OF", leagueId: testLeagueId });
    await request(app)
      .post("/addedPlayerPool/add")
      .send({ name: "Player B", position: "SP", leagueId: "otherleague" });
    const res = await request(app)
      .get(`/addedPlayerPool/manualPlayers/${testLeagueId}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toBe("Player A");
  });
});
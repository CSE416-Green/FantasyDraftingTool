const request = require("supertest");
const { app } = require("../server");
const mongoose = require("mongoose");
const User = require("../models/UserSchema");
const { MongoMemoryServer } = require("mongodb-memory-server");

//bypasses the otp rate limiter 
jest.mock("express-rate-limit", () => {
  return jest.fn(() => (req, res, next) => next());
});

// mock resend 
jest.mock("resend", () => {
    return {
      Resend: jest.fn().mockImplementation(() => ({
        emails: {
          send: jest.fn().mockResolvedValue({ id: "mock-email-id" }),
        },
      })),
    };
});

let mongoServer;

beforeAll(async () => {
  await mongoose.disconnect();
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterEach(async () => {
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

//creates a test user
const createUser = async () => {
  const bcrypt = require("bcrypt");
  const hashedPassword = await bcrypt.hash("password123", 10);
  return await User.create({
    firstName: "Test",
    lastName: "User",
    username: "testuser",
    email: "test@test.com",
    password: hashedPassword,
  });
};

describe("POST /user/forgot-password", () => {
  it("should overwrite a previous OTP if user requests again before expiry", async () => {
    const user = await createUser();
    user.resetToken = "111111";
    user.resetTokenExpiry = Date.now() + 1000 * 60 * 5;
    await user.save();

    await request(app)
      .post("/user/forgot-password")
      .send({ email: "test@test.com" });

    const updated = await User.findOne({ email: "test@test.com" });
    expect(updated.resetToken).not.toBe("111111"); 
  });

  it("should set resetToken and resetTokenExpiry on user when email exists", async () => {
    await createUser();
    await request(app)
      .post("/user/forgot-password")
      .send({ email: "test@test.com" });
    const user = await User.findOne({ email: "test@test.com" });
    expect(user.resetToken).toBeDefined();
    expect(user.resetTokenExpiry).toBeDefined();
  });
});


describe("POST /user/verify-otp", () => {
  it("should return 400 when otp field is missing", async () => {
    const res = await request(app)
      .post("/user/verify-otp")
      .send({ email: "test@test.com" });
    expect(res.status).toBe(400);
  });

  it("should reject an OTP that is not 6 digits", async () => {
    const user = await createUser();
    user.resetToken = "123456";
    user.resetTokenExpiry = Date.now() + 1000 * 60 * 5;
    await user.save();

    const res = await request(app)
      .post("/user/verify-otp")
      .send({ email: "test@test.com", otp: "123" }); 
    expect(res.status).toBe(400);
  });

  it("should reject an OTP that is 7 digits", async () => {
    const res = await request(app)
      .post("/user/verify-otp")
      .send({ email: "test@test.com", otp: "1234567" });
    expect(res.status).toBe(400);
  }); 

  it("should reject a non-numeric OTP", async () => {
    const user = await createUser();
    user.resetToken = "123456";
    user.resetTokenExpiry = Date.now() + 1000 * 60 * 5;
    await user.save();

    const res = await request(app)
      .post("/user/verify-otp")
      .send({ email: "test@test.com", otp: "abcdef" });
    expect(res.status).toBe(400);
  });

  it("should return 400 for a user who never requested a reset", async () => {
    await createUser(); 
    const res = await request(app)
      .post("/user/verify-otp")
      .send({ email: "test@test.com", otp: "123456" });
    expect(res.status).toBe(400);
  });

  it("should verify a valid OTP", async () => {
    const user = await createUser();
    user.resetToken = "123456";
    user.resetTokenExpiry = Date.now() + 1000 * 60 * 5;
    await user.save();
    const res = await request(app)
      .post("/user/verify-otp")
      .send({ email: "test@test.com", otp: "123456" });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("OTP verified");
  });

});


describe("POST /user/reset-password", () => {
  it("should return 400 for a user that does not exist", async () => {
    const res = await request(app)
      .post("/user/reset-password")
      .send({ email: "ghost@test.com", otp: "123456", password: "newpassword" });
    expect(res.status).toBe(400);
  });

  it("should return 400 for an expired OTP", async () => {
    const user = await createUser();
    user.resetToken = "123456";
    user.resetTokenExpiry = Date.now() - 1000; // already expired
    await user.save();

    const res = await request(app)
      .post("/user/reset-password")
      .send({ email: "test@test.com", otp: "123456", password: "newpassword" });
    expect(res.status).toBe(400);
  });

  it("should not allow the same OTP to be used twice", async () => {
    const user = await createUser();
    user.resetToken = "123456";
    user.resetTokenExpiry = Date.now() + 1000 * 60 * 5;
    await user.save();

    await request(app)
      .post("/user/reset-password")
      .send({ email: "test@test.com", otp: "123456", password: "newpassword" });

    const res = await request(app)
      .post("/user/reset-password")
      .send({ email: "test@test.com", otp: "123456", password: "anotherpassword" });
    expect(res.status).toBe(400);
  });

  it("should successfully reset password with valid OTP", async () => {
    const bcrypt = require("bcrypt");
    const user = await createUser();
    user.resetToken = "123456";
    user.resetTokenExpiry = Date.now() + 1000 * 60 * 5;
    await user.save();

    const res = await request(app)
      .post("/user/reset-password")
      .send({ email: "test@test.com", otp: "123456", password: "newpassword" });
    expect(res.status).toBe(200);

    const updated = await User.findOne({ email: "test@test.com" });
    const match = await bcrypt.compare("newpassword", updated.password);
    expect(match).toBe(true);
    expect(updated.resetToken).toBeUndefined();
    expect(updated.resetTokenExpiry).toBeUndefined();
  });

});
const request = require("supertest");
const { app } = require("../server");
const mongoose = require("mongoose");
const User = require("../models/UserSchema");
const { MongoMemoryServer } = require("mongodb-memory-server");

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

//AI generated to test routes and edge cases 
// helper to create a test user
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
  it("should return same message whether email exists or not", async () => {
    const res = await request(app)
      .post("/user/forgot-password")
      .send({ email: "nonexistent@test.com" });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe(
      "If the email address is valid you will receive a One Time Password via email."
    );
  });

  it("should return same message when email does exist", async () => {
    await createUser();
    //mock resend so no real email is sent
    const res = await request(app)
      .post("/user/forgot-password")
      .send({ email: "test@test.com" });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe(
      "If the email address is valid you will receive a One Time Password via email."
    );
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

  it("should reject an incorrect OTP", async () => {
    const user = await createUser();
    user.resetToken = "123456";
    user.resetTokenExpiry = Date.now() + 1000 * 60 * 5;
    await user.save();

    const res = await request(app)
      .post("/user/verify-otp")
      .send({ email: "test@test.com", otp: "999999" });
    expect(res.status).toBe(400);
  });

  it("should reject an expired OTP", async () => {
    const user = await createUser();
    user.resetToken = "123456";
    user.resetTokenExpiry = Date.now() - 1000; // already expired
    await user.save();

    const res = await request(app)
      .post("/user/verify-otp")
      .send({ email: "test@test.com", otp: "123456" });
    expect(res.status).toBe(400);
  });

  it("should reject OTP for wrong email", async () => {
    const user = await createUser();
    user.resetToken = "123456";
    user.resetTokenExpiry = Date.now() + 1000 * 60 * 5;
    await user.save();

    const res = await request(app)
      .post("/user/verify-otp")
      .send({ email: "wrong@test.com", otp: "123456" });
    expect(res.status).toBe(400);
  });
});

describe("POST /user/reset-password", () => {
  it("should reset password with valid OTP", async () => {
    const bcrypt = require("bcrypt");
    const user = await createUser();
    user.resetToken = "123456";
    user.resetTokenExpiry = Date.now() + 1000 * 60 * 5;
    await user.save();

    const res = await request(app)
      .post("/user/reset-password")
      .send({ email: "test@test.com", otp: "123456", password: "newpassword" });
    expect(res.status).toBe(200);

    // verify password actually changed
    const updated = await User.findOne({ email: "test@test.com" });
    const match = await bcrypt.compare("newpassword", updated.password);
    expect(match).toBe(true);
  });

  it("should clear resetToken and resetTokenExpiry after reset", async () => {
    const user = await createUser();
    user.resetToken = "123456";
    user.resetTokenExpiry = Date.now() + 1000 * 60 * 5;
    await user.save();

    await request(app)
      .post("/user/reset-password")
      .send({ email: "test@test.com", otp: "123456", password: "newpassword" });

    const updated = await User.findOne({ email: "test@test.com" });
    expect(updated.resetToken).toBeUndefined();
    expect(updated.resetTokenExpiry).toBeUndefined();
  });

  it("should reject reset with expired OTP", async () => {
    const user = await createUser();
    user.resetToken = "123456";
    user.resetTokenExpiry = Date.now() - 1000; // expired
    await user.save();

    const res = await request(app)
      .post("/user/reset-password")
      .send({ email: "test@test.com", otp: "123456", password: "newpassword" });
    expect(res.status).toBe(400);
  });

  it("should reject reset with wrong OTP", async () => {
    const user = await createUser();
    user.resetToken = "123456";
    user.resetTokenExpiry = Date.now() + 1000 * 60 * 5;
    await user.save();

    const res = await request(app)
      .post("/user/reset-password")
      .send({ email: "test@test.com", otp: "999999", password: "newpassword" });
    expect(res.status).toBe(400);
  });

  it("should not allow same OTP to be used twice", async () => {
    const user = await createUser();
    user.resetToken = "123456";
    user.resetTokenExpiry = Date.now() + 1000 * 60 * 5;
    await user.save();

    await request(app)
      .post("/user/reset-password")
      .send({ email: "test@test.com", otp: "123456", password: "newpassword" });

    // try to use same OTP again
    const res = await request(app)
      .post("/user/reset-password")
      .send({ email: "test@test.com", otp: "123456", password: "anotherpassword" });
    expect(res.status).toBe(400);
  });
});
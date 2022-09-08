const express = require("express");
const User = require("../models/user");
const router = new express.Router();
const bcrypt = require("bcryptjs");
const auth = require("../middleware/auth");
const multer = require("multer");
const sharp = require("sharp");
const { sendWelcomeEmail, sendCancelationEmail } = require("../emails/account");
// const { sendCancelationEmail } = require("../emails/account");

///////// Users resource creation Endpoint ///////
router.post("/users", async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    sendWelcomeEmail(user.email, user.name);
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

//////// user endpoint to login //////////
router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    if (user.tokens.length >= 5) {
      res.status(400).send("Maximum number of login device exceeded");
    }

    const token = await user.generateAuthToken();
    res.send({ user: user, token });
  } catch (e) {
    res.status(400).send();
  }
});

//////// Logging out a user by removing the the token he/she uses personally/////////
router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

///// logging out a user by removing all tokens e.g you want to stop people from using your netflix accout by removing all tokens they use ////

router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    // req.user.tokens = req.user.tokens.filter((token) => {
    //   return tokens.length === 0;
    // });
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send(e);
  }
});

///// fetch a users's profile from database /////////
router.get("/users/me", auth, async (req, res) => {
  res.send(req.user);
});

/////// user Resource updating Endpoints /////////
router.patch("/users/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "password", "age"];

  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );
  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }

  try {
    const user = req.user;

    updates.forEach((update) => (user[update] = req.body[update]));

    await user.save();

    res.send(user);
  } catch (e) {
    res.status(400).send(e);
  }
});

/////// Deleting User account endpoint //////
router.delete("/users/me", auth, async (req, res) => {
  try {
    const user = req.user;
    await user.remove();
    sendCancelationEmail(user.email, user.name);
    res.status(200).send(user);
  } catch (e) {
    res.status(500).send();
  }
});

///// functionality for using images /////
const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|png|jpeg)/)) {
      return cb(new Error("Please upload an image file"));
    }
    cb(undefined, true);
  },
});

////// Upload profile picture enpoint ////////
router.post(
  "/users/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);

///// delete profile profile picture endpoint ////
router.delete("/users/me/avatar", auth, async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.send();
});

//// fetching the profle picture endpoint ////
router.get("/users/:id/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.avatar) {
      throw new Error();
    }
    res.set("Content-Type", "image/png");
    res.send(user.avatar);
  } catch (e) {
    res.status(404).send();
  }
});

module.exports = router;

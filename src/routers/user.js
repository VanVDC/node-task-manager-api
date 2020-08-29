const express = require("express");
const multer = require("multer"); //upload file
const sharp = require("sharp"); //edit photo
const User = require("../models/user");
const { update } = require("../models/user");
const auth = require("../middleware/auth"); //getting the auth middleware
const { sendWelcomeEmail, sendCancelationEmail } = require("../emails/account");
const router = new express.Router(); //using router

//get all users
router.get("/users/me", auth, async (req, res, next) => {
  res.send(req.user);

  // try {
  //   const user = await User.find({});
  //   res.status(200).send({
  //     user,
  //   });
  // } catch (e) {
  //   res.status(500).send();
  // }
  // User.find({})
  //   .then((users) => {
  //     res.status(200).send({
  //       users,
  //     });
  //   })
  //   .catch((err) => res.status(500).send());
});

// //get user with id
// router.get("/users/:id", async (req, res, next) => {
//   try {
//     const user = await User.findById(req.params.id);
//     if (!user) {
//       return res.status(404).send();
//     }
//     res.status(200).send(user);
//   } catch (e) {
//     res.status(500).send();
//   }
//   // User.findById(req.params.id)
//   //   .then((user) => {
//   //     if (!user) {
//   //       return res.status(404).send();
//   //     }
//   //     res.status(200).send(user);
//   //   })
//   //   .catch((err) => res.status(500).send());
// });
//create user
router.post("/users", async (req, res, next) => {
  const user = new User(req.body);
  try {
    await user.save(); //alway save the data file when using it
    sendWelcomeEmail(user.email, user.name);
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }

  // user
  //   .save()
  //   .then(() => {
  //     res.status(201).send(user);
  //   })
  //   .catch((err) => {
  //     res.status(400).send(err);
  //   });
});

//create a post for login

router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      //not module function but mine
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken(); //not module function but mine

    res.send({ user, token });
  } catch (e) {
    res.status(400).send();
  }
});
//logout

router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save(); //alway save the data file when using it
    res.send();
  } catch (err) {
    res.status(500).send();
  }
});
//logout all

router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save(); //alway save the data file when using it
    res.send();
  } catch (err) {
    res.status(500).send();
  }
});
//update user by id
router.patch("/users/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "password", "age"];
  const isValidOperation = updates.every((update) => {
    return allowedUpdates.includes(update);
  });

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates" });
  }

  try {
    // const user = await User.findById(req.user._id);
    updates.forEach(
      (update) => (req.user[update] = req.body[update]) //updating the data
    );
    await req.user.save(); //alway save the data file when using it
    // const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    //   new: true,
    //   runValidators: true,
    // });

    // if (!user) {
    //   return res.status(404).send();
    // }

    res.send(req.user);
  } catch (e) {
    res.status(400).send(e);
  }
});

//delete user

router.delete("/users/me", auth, async (req, res) => {
  // const id = req.params.id;
  try {
    // const user = await User.findByIdAndDelete(req.user._id);

    // if (!user) {
    //   return res.status(404).send();
    // }
    await req.user.remove();
    sendCancelationEmail(req.user.email, req.user.name);

    res.send(req.user);
  } catch (e) {
    res.status(500).send();
  }
});

//update files/images+++++++++++++++++++++++++++++++++++

const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.jpg|jpeg|png/)) {
      return cb(new Error("File must be a image"));
    }
    cb(undefined, true);
  },
});

router.post(
  "/users/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer(); //normalize the image
    req.user.avatar = buffer;
    await req.user.save(); //alway save the data file when using it
    res.send();
  },
  (err, req, res, next) => {
    res.status(400).send({ error: err.message });
  }
);

//clear avatar image
router.delete("/users/me/avatar", auth, async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save(); //alway save the data file when using it
  res.send();
});

//fetching avatar

router.get("/users/:id/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.avatar) {
      throw new Error();
    }

    res.set("Content-Type", "image/png");
    res.send(user.avatar);
  } catch (err) {
    res.status(400).send();
  }
});
module.exports = router;

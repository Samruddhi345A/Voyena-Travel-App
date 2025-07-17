// server/routes/auth.js
const router = require("express").Router();

router.get("/", (req, res) => {
    res.send("users route is working!");
});

module.exports = router;

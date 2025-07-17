const router=require("express").Router();
router.get("/", (req, res) => {
    res.send("categories route is working!");
});

module.exports = router;
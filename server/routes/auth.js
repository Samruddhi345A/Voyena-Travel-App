const router = require("express").Router();
const passport = require("passport");
const bcrypt = require("bcrypt");
const User = require("../model/User");
const jwt = require("jsonwebtoken");
const verifyJWT = require("../middleware/auth.js");

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
    "/google/callback",
    passport.authenticate("google", {
        session: false,
    }),
    (req, res) => {
const user= req.user;
const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET,{expiresIn:"1d"});
        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
        });

       res.redirect("http://localhost:5173/auth-redirect");
    })
;


router.get("/logout",(req,res)=>{
    res.clearCookie("token",{httpOnly:true,secure:false,sameSite:"lax" });
    res.status(200).json("Logout successful");
})


router.get("/user",verifyJWT, async (req, res) => {
  try{
    const user = await User.findById(req.user.id).select("-password");
    res.status(200).json(user);
  }catch(err){
    res.status(500).json("Failed to fecth user",err);
  }
});


module.exports = router;
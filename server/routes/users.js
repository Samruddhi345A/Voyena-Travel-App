const User = require("../model/User");
const verifyJWT = require("../middleware/auth");
const router = require("express").Router();  
router.get("/allusers",verifyJWT, async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    
    try{
        const users = await User.find().skip(offset).limit(limit);
        const total = await User.countDocuments();
    
        if (total === 0) {
            return res.status(200).json({ users: [], total:0 });
        }
        
        return res.status(200).json({ users, total });
    }catch(err){
        console.log(err);
        return res.status(500).json(err);
    }
});

module.exports= router

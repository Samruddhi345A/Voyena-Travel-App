const passport=require("passport")
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User=require("./model/User")
require("dotenv").config()  

passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:5000/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done)=> {
        try{
            const existingUser = await User.findOne({ email: profile.emails[0].value });
            if (existingUser) {
                return done(null, existingUser);
            }
        
        const newUser = new User({
            googleId: profile.id,
            name: profile.displayName,
            accountid: profile.id,
            authProvider: "google",
            password:crypto.randomUUID(),
            email: profile.emails[0].value,
            imageUrl: profile.photos[0].value,
        });
        await newUser.save();
        return done(null, newUser);
    
}catch(err){
            console.log(err)
        }}          
));

passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
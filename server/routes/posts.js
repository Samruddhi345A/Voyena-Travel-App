const router = require("express").Router();
const jwt = require("jsonwebtoken");
const Trip = require("../model/Trips.js");
const User = require("../model/User.js");
const verifyAdminJWT = require("../middleware/verifyAdmin.js");
const { GoogleGenerativeAI } = require("@google/generative-ai");


// router.post("/create-trips",verifyAdminJWT, async (req, res) => {
//     const {trip,imageUrls,userId} = req.body;
//     if (!trip || !imageUrls || !userId) {
//         return res.status(400).json({ error: "Missing required fields" });
//     }
//     try {
//         const newTrip = new Trip({   tripDetail: JSON.stringify(trip), imageUrls, userId });
//         await newTrip.save();
//         res.status(201).json({id: savedTrip._id });
//     } catch (error) {
//         console.error("Error creating trip:", error);
//         res.status(500).json({ error: "Internal server error" });   
//     }
// });


function parseMarkdownToJson(markdownText) {
  const regex = /```json\n([\s\S]+?)\n```/;
  const match = markdownText.match(regex);

  if (match && match[1]) {
    try {
      return JSON.parse(match[1]);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return null;
    }
  }
  console.error("No valid JSON found in markdown text.");
  return null;
}

router.post("/create-trips", async (req, res) => {
  const {
    country,
    numberOfDays,
    travelStyle,
    interests,
    budget,
    groupType,
    userId,
  } = req.body;

  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

  try {
   const prompt = `Generate a ${numberOfDays}-day travel itinerary for ${country} based on the following user information:
        Budget: '${budget}'
        Interests: '${interests}'
        TravelStyle: '${travelStyle}'
        GroupType: '${groupType}'
        Return the itinerary and lowest estimated price in a clean, non-markdown JSON format with the following structure:
        {
        "name": "A descriptive title for the trip",
        "description": "A brief description of the trip and its highlights not exceeding 100 words",
        "estimatedPrice": "Lowest average price for the trip in USD, e.g.$price",
        "duration": ${numberOfDays},
        "budget": "${budget}",
        "travelStyle": "${travelStyle}",
        "country": "${country}",
        "interests": ${interests},
        "groupType": "${groupType}",
        "bestTimeToVisit": [
          '🌸 Season (from month to month): reason to visit',
          '☀️ Season (from month to month): reason to visit',
          '🍁 Season (from month to month): reason to visit',
          '❄️ Season (from month to month): reason to visit'
        ],
        "weatherInfo": [
          '☀️ Season: temperature range in Celsius (temperature range in Fahrenheit)',
          '🌦️ Season: temperature range in Celsius (temperature range in Fahrenheit)',
          '🌧️ Season: temperature range in Celsius (temperature range in Fahrenheit)',
          '❄️ Season: temperature range in Celsius (temperature range in Fahrenheit)'
        ],
        "location": {
          "city": "name of the city or region",
          "coordinates": [latitude, longitude],
          "openStreetMap": "link to open street map"
        },
        "itinerary": [
        {
          "day": 1,
          "location": "City/Region Name",
          "activities": [
            {"time": "Morning", "description": "🏰 Visit the local historic castle and enjoy a scenic walk"},
            {"time": "Afternoon", "description": "🖼️ Explore a famous art museum with a guided tour"},
            {"time": "Evening", "description": "🍷 Dine at a rooftop restaurant with local wine"}
          ]
        },
        ...
        ]
        }`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const textResult = await model.generateContent([prompt]);
    const tripRaw = parseMarkdownToJson(textResult.response.text());

    const trip = typeof tripRaw === "string" ? JSON.parse(tripRaw) : tripRaw;
const imageResponse = await fetch(
  `https://api.unsplash.com/search/photos?query=${country} ${interests} ${travelStyle}&client_id=${process.env.UNSPLASH_ACCESS_KEY}`
);

const imageJson = await imageResponse.json();

if (!Array.isArray(imageJson.results)) {
  console.error("Unexpected Unsplash API response:", imageJson);
  return res.status(500).json({ error: "Image fetch failed" });
}

const imageUrls = imageJson.results
  .map((img) => img.urls?.regular)
  .slice(0, 3)
  .map((url) => url || null);


   const savedTrip = await Trip.create({
  tripDetail: JSON.stringify(trip),
  imageUrls,
  userId
});

res.status(201).json({ id: savedTrip._id });

  } catch (err) {
    console.log("Error generating trip:", err);
    return res.status(500).json({ error: "Trip generation failed" });
  }
});

module.exports = router;

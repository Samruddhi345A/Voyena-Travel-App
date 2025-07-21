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
    duration,
    travelStyle,
    interests,
    budget,
    groupType,
    userId,
  } = req.body;

  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

  try {
   const prompt = `Generate a ${duration}-day travel itinerary for ${country} based on the following user information:
        Budget: '${budget}'
        Interests: '${interests}'
        TravelStyle: '${travelStyle}'
        GroupType: '${groupType}'
        Return the itinerary and lowest estimated price in a clean, non-markdown JSON format with the following structure:
        {
        "name": "A descriptive title for the trip",
        "description": "A brief description of the trip and its highlights not exceeding 100 words",
        "estimatedPrice": "Lowest average price for the trip in USD, e.g.$price",
        "duration": ${duration},
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

router.get("/getAllTrips", async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
  try {
    const trips = await Trip.find().sort({createdAt:-1}).skip(offset).limit(limit);
    const total = await User.countDocuments();
    if (total === 0) {
      return res.status(200).json({ trips: [], total: 0 });
    }
    res.status(200).json({ trips, total });
  } catch (err) {
    console.log("Error fetching trips:", err);
    res.status(500).json({ error: "Failed to fetch trips" });

  }
});

router.get("/getTrip/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const trip = await Trip.findById(id);
    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }
    console.log("Trip fetched successfully:", trip);
    res.status(200).json(trip);
  } catch (err) {
    console.log("Error fetching trip:", err);
    res.status(500).json({ error: "Failed to fetch trip" });
  }
});
module.exports = router;

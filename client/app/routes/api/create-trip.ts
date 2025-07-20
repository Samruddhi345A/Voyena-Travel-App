import type { ActionFunctionArgs } from "react-router";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { parseMarkdownToJson } from "lib/utils";

export const action  = async({request}:ActionFunctionArgs)=>{
    const {
        country,
        numberOfDays,
        travelStyle,
        interests,
        budget,
        groupType,
        userId,
    } = await request.json();

    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_GENERATIVE_AI_KEY!);

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

        const imageResponse = await fetch(`https://api.unsplash.com/photos/search?query=${country} ${interests} ${travelStyle}&client_id=${import.meta.env.VITE_UNSPLASH_ACCESS_KEY}`);

        const imageUrls = (await imageResponse.json()).map((image: any) => image.urls.regular).slice(0, 3).map((result: string) => result || null);

        const tripData = {
            ...(typeof trip === "object" && trip !== null ? trip : {}),
            imageUrls,
            userId,
        };

        const result = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/create-trips`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(tripData),
            credentials: "include"
        });
        const data = await result.json();
        return { id: data.id };

    } catch(err) {
        console.log("Error Generating Trip", err);
    }
}

import { NextResponse } from "next/server";

// Fallback intelligent local travel response generator
function getLocalAIResponse(message: string, destination?: string, interests?: string[], budget?: string, days?: number) {
  const msg = message.toLowerCase();
  const dest = destination || "your destination";
  const daysCount = days || 5;
  const budgetVal = budget || "Moderate";
  const interestList = interests && interests.length > 0 ? interests.join(", ") : "sightseeing, cultural exploration, and local food";

  // 1. Check if asking for trip planning or itinerary
  if (msg.includes("plan") || msg.includes("itinerary") || msg.includes("schedule") || msg.includes("customized trip") || msg.includes("suggest a trip") || (destination && msg.includes("hi") && msg.length < 15)) {
    return {
      message: `Here is a custom **${daysCount}-day itinerary** for **${dest}** tailored to your interests in **${interestList}** with a **${budgetVal}** budget.

### 🗺️ Day-by-Day Itinerary

* **Day 1: Arrival & Local Exploration**
  Arrive in ${dest}. Check into your hotel. Spend the afternoon taking a relaxing walk around the historic city center, capturing photographs, and enjoying a local café. In the evening, sample traditional street food.
  *Estimated Cost: ₹1,500 ($20)*

* **Day 2: Cultural Heritage & Highlights**
  Hire a local guide to visit the famous heritage landmarks and museums. Dive deep into the history and architecture. For lunch, try a authentic local restaurant recommended by your guide.
  *Estimated Cost: ₹3,000 ($40) incl. entry fees*

* **Day 3: Adventure & Nature Getaway**
  Dedicate this day to your interest in adventure. Go on a light day-hike, rent gear (like boots or backpacks) from local vendor hubs, or take a scenic drive to the nearby valley/countryside.
  *Estimated Cost: ₹2,500 ($30)*

* **Day 4: Hidden Gems & Shopping**
  Explore the traditional local markets. Pick up regional spices, tea, handicrafts, or local textiles. Visit a scenic viewpoint for sunset photography.
  *Estimated Cost: ₹4,000 ($50) incl. shopping*

* **Day 5: Departure & Fond Memories**
  Enjoy a lazy morning breakfast. Write down your travel journal entries. Pack your luggage and head to the airport/station for your return flight.
  *Estimated Cost: ₹800 ($10)*

### 💡 Local Tips & Scams to Avoid
1. **Pony/Sledge Rides:** Always negotiate the price beforehand or book through government-approved counters to avoid being overcharged.
2. **Connectivity:** Postpaid SIM cards are required in certain regions (like Jammu & Kashmir). Carry physical copies of your maps and booking details just in case.
3. **Customs:** Dress modestly when visiting sacred temples, shrines, or heritage houses. Remove shoes where required.

### 🎒 Packing Suggestions
* Comfortable walking/hiking shoes
* Insulated layers (light sweater or jacket depending on season)
* Universal power bank & camera equipment
* Personal first-aid kit`,
      itineraryGenerated: true
    };
  }

  // 2. Translate phrases
  if (msg.includes("translate") || msg.includes("language") || msg.includes("speak") || msg.includes("how do you say")) {
    return {
      message: `Here are some essential local phrases that will help you connect with people in **${dest}**:

1. **"Hello / Greetings"**
   *Local:* "Salaam Alaikum" (in J&K) / "Namaste" (general India)
   *Response:* "Wa Alaikum Salaam" / "Namaste"

2. **"How much does this cost?"**
   *Local:* "Yeh kitne ka hai?" (Hindi) / "Amih kyah baah keemath?" (Kashmiri)

3. **"Thank you very much"**
   *Local:* "Shukriya" (Urdu/Hindi) / "Meharbani" (Kashmiri)

4. **"Where is the nearest hospital/police station?"**
   *Local:* "Nazdeek hospital kahaan hai?" (Hindi)

*Tip: Standard English is widely understood in shops, hotels, and tourist spots, but speaking a few words of the local language goes a long way!*`
    };
  }

  // 3. Food recommendations
  if (msg.includes("food") || msg.includes("eat") || msg.includes("restaurant") || msg.includes("dish") || msg.includes("cuisine")) {
    return {
      message: `Here are the top culinary highlights you **must try** in **${dest}**:

* **Kashmiri Wazwan:** A multi-course traditional feast. Key dishes include *Rogan Josh* (tender lamb in red gravy), *Rista* (minced meatballs in saffron gravy), and *Gushtaba* (meatballs in yogurt gravy).
* **Kahwa:** Traditional Kashmiri green tea brewed with saffron, almonds, cardamom, and cinnamon. Perfect for staying warm!
* **Harissa:** A slow-cooked lamb and rice paste dish eaten for breakfast during winters.
* **Noon Chai:** Pink salted tea brewed with baking soda. An acquired local taste best paired with local bakery bread (*Girda* or *Bakirkhani*).

*For vegetarians, try **Kashmiri Dum Aloo** and **Chaman** (fried paneer in yellow turmeric gravy).*`
    };
  }

  // 4. Emergency/Medical
  if (msg.includes("emergency") || msg.includes("hospital") || msg.includes("police") || msg.includes("help") || msg.includes("sos") || msg.includes("sick")) {
    return {
      message: `🚨 **EMERGENCY ASSISTANCE FOR ${dest.toUpperCase()}** 🚨

If you are experiencing a medical or security emergency, please take these steps immediately:

1. **National Emergency Numbers (India):**
   * **All-in-one Emergency Helpline:** **112**
   * **Police:** **100**
   * **Ambulance:** **102**
   * **Fire Force:** **101**

2. **Nearest Hospital Facilities:**
   * *Srinagar:* SMHS Hospital (Karan Nagar) or SKIMS (Soura).
   * *Gulmarg:* Government Emergency Hospital (near Gondola base).

3. **Offline Safety Checklist:**
   * Head to the **Emergency Center** tab in the Voyana app to trigger an instant SOS ping to your family contacts.
   * Access the **Offline Guide** containing regional emergency phone numbers and local embassy locations.`
    };
  }

  // 5. Default Response
  return {
    message: `Hello! I am your **Voyana AI Travel Assistant**. I can help you plan your day-by-day itineraries, translate local phrases, suggest traditional food, or provide safety guidance for **${dest}**.

What would you like to explore next? Feel free to ask:
* *"Generate an itinerary for Gulmarg"*
* *"What local food should I try?"*
* *"Translate basic shopping phrases"*
* *"Where is the nearest hospital?"*`
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messages, destination, budget, days, interests } = body;

    if (!messages || !messages.length) {
      return NextResponse.json({ error: "Message history is required" }, { status: 400 });
    }

    const latestMessage = messages[messages.length - 1].content;

    // Check if OpenAI key exists
    if (process.env.OPENAI_API_KEY) {
      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: `You are Voyana's premium AI Travel Companion. You help independent travelers explore confidently before, during, and after their journeys.
                Provide structured, markdown-formatted responses with sections, lists, and bold text. Keep advice concise, actionable, and friendly.
                Active Destination context: ${destination || "Global"}. Budget: ${budget || "Moderate"}. Interests: ${(interests || []).join(", ")}.`,
              },
              ...messages,
            ],
            temperature: 0.7,
            max_tokens: 800,
          }),
        });

        const data = await response.json();
        if (data.choices && data.choices[0]) {
          return NextResponse.json({
            message: data.choices[0].message.content,
            openaiUsed: true,
          });
        }
      } catch (err) {
        console.warn("OpenAI fetch failed, falling back to local travel AI engine.", err);
      }
    }

    // Local Travel AI Engine fallback
    const localResult = getLocalAIResponse(latestMessage, destination, interests, budget, days);
    return NextResponse.json({
      message: localResult.message,
      itineraryGenerated: localResult.itineraryGenerated || false,
      openaiUsed: false,
    });
  } catch (error: any) {
    console.error("AI assistant route error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

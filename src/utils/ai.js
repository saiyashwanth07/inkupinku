import { predictColleges } from "./predictor";
import { getColleges } from "./db";

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || "";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL_NAME = "llama-3.1-8b-instant";

export const isGroqConfigured = () => {
  return GROQ_API_KEY.trim() !== "" && !GROQ_API_KEY.includes("YOUR_");
};

// System instruction to guide the AI Counselor
const SYSTEM_PROMPT = `You are playing the role of two expert AP EAPCET AI Counselors: "Inku" (a highly logical, data-driven male counselor) and "Pinku" (a supportive, encouraging, and highly knowledgeable female counselor).
Your goal is to guide students on engineering admissions, branch selections, fee structures, and category quotas in Andhra Pradesh.
Be helpful, premium, and concise.

CRITICAL INSTRUCTION: You MUST start every response with either "Inku:" or "Pinku:". Do not forget this prefix. You can choose who speaks based on the tone of the answer (Inku for data/predictions, Pinku for advice/support), but choose only ONE character to speak per message.

If the user provides details like their Rank, Admission Category, Gender, and Local Region, you MUST call the "predict_colleges" tool to calculate their list of eligible institutions. 
Do not guess closing ranks. Always rely on the tool output for predictions.
Once you receive the tool outputs, present the top 3-5 options clearly: specify the college name, branch, closing cutoff rank, and admission chance tier (Safe, Possible, Borderline). Explain why they have a good chance.

Context parameters:
- Local Regions: AU (Andhra University - Coastal), SVU (Sri Venkateswara University - Rayalaseema/Nellore), OU (Osmania University - Non-Local).
- Categories: OC, BC_A, BC_B, BC_C, BC_D, BC_E, SC, ST.`;

// Expose the predictor tool to the LLM
const TOOLS_DEFINITION = [
  {
    type: "function",
    function: {
      name: "predict_colleges",
      description: "Calculates eligible engineering colleges based on the student's EAPCET rank, category, gender, and local area.",
      parameters: {
        type: "object",
        properties: {
          rank: { 
            type: "integer", 
            description: "The student's AP EAPCET rank (e.g. 15000)." 
          },
          category: { 
            type: "string", 
            enum: ["OC", "BC_A", "BC_B", "BC_C", "BC_D", "BC_E", "SC", "ST"],
            description: "The admission category." 
          },
          gender: { 
            type: "string", 
            enum: ["Boys", "Girls"], 
            description: "Gender reservation (use Boys for co-education/general quota)." 
          },
          localArea: { 
            type: "string", 
            enum: ["AU", "SVU", "OU"], 
            description: "Local area region of the candidate." 
          }
        },
        required: ["rank", "category", "gender", "localArea"]
      }
    }
  }
];

export const getGroqAIResponse = async (chatMessages) => {
  // 1. Fallback Mock Simulator if API key is not configured
  if (!isGroqConfigured()) {
    return await simulateAICounselorResponse(chatMessages);
  }

  try {
    // Prep request payload
    const formattedMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...chatMessages.map(msg => ({ role: msg.role, content: msg.content }))
    ];

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: formattedMessages,
        tools: TOOLS_DEFINITION,
        tool_choice: "auto"
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API returned error status: ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message;

    // Check if the model requested a tool call
    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      const toolCall = assistantMessage.tool_calls[0];
      
      if (toolCall.function.name === "predict_colleges") {
        const args = JSON.parse(toolCall.function.arguments);
        
        // Execute local college predictor function
        const freshColleges = await getColleges();
        const matches = predictColleges({
          rank: Number(args.rank),
          category: args.category,
          gender: args.gender,
          localArea: args.localArea,
          colleges: freshColleges
        });

        // Slice top 10 matches for token efficiency
        const limitedMatches = matches.slice(0, 10).map(c => ({
          name: c.name,
          code: c.code,
          district: c.district,
          type: c.type,
          tuitionFee: c.tuitionFee,
          eligibleBranches: c.eligibleBranches.map(eb => ({
            branch: eb.branch,
            closingRank: eb.closingRank,
            chance: eb.chance
          }))
        }));

        // Submit tool output back to Groq
        const followUpMessages = [
          { role: "system", content: SYSTEM_PROMPT },
          ...chatMessages.map(msg => ({ role: msg.role, content: msg.content })),
          assistantMessage, // The tool call request message
          {
            role: "tool",
            tool_call_id: toolCall.id,
            name: "predict_colleges",
            content: JSON.stringify({
              inputParams: args,
              matchesCount: matches.length,
              sampleMatches: limitedMatches
            })
          }
        ];

        const secondResponse = await fetch(GROQ_API_URL, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: MODEL_NAME,
            messages: followUpMessages
          })
        });

        if (!secondResponse.ok) {
          throw new Error("Groq follow up tool completion failed");
        }

        const secondData = await secondResponse.json();
        return {
          role: "assistant",
          content: secondData.choices[0].message.content
        };
      }
    }

    return {
      role: "assistant",
      content: assistantMessage.content
    };

  } catch (err) {
    console.error("Groq integration failed, fallback to simulator", err);
    return await simulateAICounselorResponse(chatMessages);
  }
};

// High-Fidelity Local AI Simulation Regex engine
const simulateAICounselorResponse = async (chatMessages) => {
  // Wait brief latency to feel authentic
  await new Promise(r => setTimeout(r, 1200));

  const userText = chatMessages[chatMessages.length - 1].content;
  const text = userText.toLowerCase();

  // Regex checks to extract EAPCET parameters
  const rankMatch = text.match(/\b(rank|marks|my rank is|rank of)\s*[:=-]?\s*(\d{2,6})\b/) || text.match(/\b(\d{2,6})\b/);
  
  // Extract category
  let category = "OC";
  if (text.includes("bc-a") || text.includes("bc_a") || text.includes("bca")) category = "BC_A";
  else if (text.includes("bc-b") || text.includes("bc_b") || text.includes("bcb")) category = "BC_B";
  else if (text.includes("bc-c") || text.includes("bc_c") || text.includes("bcc")) category = "BC_C";
  else if (text.includes("bc-d") || text.includes("bc_d") || text.includes("bcd")) category = "BC_D";
  else if (text.includes("bc-e") || text.includes("bc_e") || text.includes("bce")) category = "BC_E";
  else if (text.includes("sc")) category = "SC";
  else if (text.includes("st")) category = "ST";

  // Extract gender
  let gender = "Boys";
  if (text.includes("girl") || text.includes("female") || text.includes("women")) gender = "Girls";

  // Extract local area
  let localArea = "AU";
  if (text.includes("svu") || text.includes("tirupati") || text.includes("rayalaseema")) localArea = "SVU";
  else if (text.includes("ou") || text.includes("osmania") || text.includes("non-local")) localArea = "OU";

  if (rankMatch) {
    const rank = Number(rankMatch[2] || rankMatch[1]);
    if (rank > 0 && rank <= 150000) {
      const freshColleges = await getColleges();
      const matches = predictColleges({ rank, category, gender, localArea, colleges: freshColleges });

      if (matches.length === 0) {
        return {
          role: "assistant",
          content: `Inku: 🤖 I evaluated your profile:\n- **Rank**: ${rank.toLocaleString()}\n- **Category**: ${category}\n- **Gender**: ${gender}\n- **Local Region**: ${localArea}\n\nUnfortunately, no local government or private engineering colleges match these parameters exactly. I highly recommend looking at our **Featured Partner Universities** or consulting our counselors directly at **7997166666** for direct admissions!`
        };
      }

      // Format top 3 colleges
      let reply = `Inku: 🤖 Based on your rank of **${rank.toLocaleString()}** (${category}, ${gender}, ${localArea} region), here are your best matched college options:\n\n`;
      
      matches.slice(0, 3).forEach((col, idx) => {
        const topBranch = col.eligibleBranches[0];
        reply += `${idx + 1}. **${col.name} (${col.code})**\n`;
        reply += `   - **Eligible Branch**: ${topBranch.branch}\n`;
        reply += `   - **Cutoff Rank**: ${topBranch.closingRank.toLocaleString()}\n`;
        reply += `   - **Admission Chance**: ${topBranch.chance === "Safe" ? "🟢 Safe" : topBranch.chance === "Possible" ? "🟡 Possible" : "🔴 Borderline"}\n`;
        reply += `   - **Tuition Fee**: ₹${col.tuitionFee.toLocaleString()} / year\n\n`;
      });

      reply += `Showing top 3 of ${matches.length} matching colleges. Log in and use the predictor search on the main screen to filter by fees, district, and specific branches!`;
      return { role: "assistant", content: reply };
    }
  }

  // Greeting / Prompt fallback
  return {
    role: "assistant",
    content: `Pinku: 👋 Hello! I am Pinku, your AP EAPCET AI Counselor (Simulator Mode).
    
I can help you search cutoffs and recommend colleges. To run a prediction, please tell me your details:
1. **Rank**: e.g., *25000*
2. **Category**: e.g., *OC*, *BC-B*, *SC*, *ST*
3. **Gender**: e.g., *Boys* or *Girls*
4. **Local Region**: e.g., *AU* (Coastal), *SVU* (Rayalaseema), *OU* (Non-local)

*Example: "I got 15000 rank, OC boys, AU area. Predict my colleges."*`
  };
};

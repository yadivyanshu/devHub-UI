import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

export async function generateAboutMe(userDetails, userQuery) {
  const query = `User Details: ${Object.entries(userDetails)
                .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`)
                        .join(", ")}, Query: ${userQuery} `;
  const chatCompletion = await getGroqChatCompletion(query);
  return chatCompletion.choices[0]?.message?.content || "";
}

export const getGroqChatCompletion = async (query) => {
  return groq.chat.completions.create({
    messages: [
        {
            role: "system",
            content:
                `You are an AI assistant specialized in crafting engaging and professional 'About Me' sections for user profiles. Based on the provided user details and input, generate a concise yet compelling paragraph that effectively showcases their expertise, skills, passions, and career aspirations.  
            
                **Output Instructions:**  
                - Maintain a natural and professional tone.  
                - Structure the response as a self-introduction in the first person.  
                - Ensure the output is formatted exactly as it should appear in the 'About' section.  
                - Example output:  
                *Hi, I'm Div Yadav, a 21-year-old engineer with a passion for harnessing the power of technology to drive innovation. With expertise in...*`,
        },
      {
        role: "user",
        content: query,
      },
    ],

    model: "llama3-8b-8192",
    temperature: 0.7, 
    max_tokens: 256,
    top_p: 1,
    stop: null,
    stream: false,
  });
};
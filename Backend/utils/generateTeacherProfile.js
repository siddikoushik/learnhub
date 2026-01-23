import OpenAI from "openai";

// Initialize lazily or check for key
let openai;
try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
} catch (error) {
  console.warn("OpenAI API Key missing or invalid. Teacher profile generation will be disabled.");
}

export const generateTeacherProfile = async (teacher) => {
  const prompt = `
Assume you are the teacher and write a well-structured, professional, and engaging tutor profile in first person (using “I”).
The tone should be friendly yet professional, suitable for an online learning platform.
The paragraph must be between 130 and 170 words and written as a single flowing paragraph (no bullet points).


Use the following details naturally without directly listing them:

Name: ${teacher.name}
Subjects: ${teacher.subjects?.join(", ")}
Teaching Experience: ${teacher.experience} years
Qualification: ${teacher.qualification}
Teaching Mode: ${teacher.mode}
Hourly Price: ${teacher.price}
Background/Bio: ${teacher.bio}

The profile should include:

A brief introduction of the teacher

Teaching experience and subject expertise

Subjects handled

Teaching style and approach

Motivation, values, and commitment to student success

Write as if the teacher is confidently introducing themselves to students and parents on a tutoring platform.
`;

  if (!openai) {
    return `Bio for ${teacher.name} (AI generation unavailable - Missing API Key)`;
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.6,
    max_tokens: 250, // enough for ~150 words
  });

  return response.choices[0].message.content.trim();
};

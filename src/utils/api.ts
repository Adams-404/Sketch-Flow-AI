
/**
 * API utility for generating Mermaid diagrams using Google Gemini API
 */

const API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

// Check if we should use the mock API or the real one
// Using mock when no API key is available
const shouldUseMock = () => {
  return !import.meta.env.VITE_GEMINI_API_KEY;
};

export const generateMermaidDiagram = async (prompt: string): Promise<string> => {
  if (shouldUseMock()) {
    // For demo purposes, simulate API call with a delay
    console.log('Using MOCK generation with prompt:', prompt);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Return a sample diagram based on the prompt
    if (prompt.toLowerCase().includes('flowchart')) {
      return `flowchart TD
    A[Start] --> B{Is it raining?}
    B -->|Yes| C[Take umbrella]
    B -->|No| D[Enjoy the sun]
    C --> E[Go outside]
    D --> E
    E --> F[End]`;
    } else if (prompt.toLowerCase().includes('sequence')) {
      return `sequenceDiagram
    participant User
    participant System
    participant Database
    
    User->>System: Request data
    System->>Database: Query data
    Database-->>System: Return results
    System-->>User: Display results`;
    } else if (prompt.toLowerCase().includes('class')) {
      return `classDiagram
    class Animal {
      +name: string
      +age: int
      +makeSound(): void
    }
    class Dog {
      +breed: string
      +fetch(): void
    }
    class Cat {
      +color: string
      +climb(): void
    }
    Animal <|-- Dog
    Animal <|-- Cat`;
    } else {
      return `graph TD
    A[${prompt.substring(0, 20)}...] --> B[Generated]
    B --> C[Diagram]
    C --> D[Example]`;
    }
  }
  
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('API key is required. Please set VITE_GEMINI_API_KEY in your .env file.');
    }

    console.log('Sending request to Gemini with prompt:', prompt);
    const response = await fetch(`${API_ENDPOINT}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are a diagram expert specializing in creating Mermaid syntax diagrams. When given a request, respond ONLY with valid Mermaid syntax code. Do not include any explanations, markdown code blocks with backticks, or anything else. Ensure the diagram is clean, well-organized, and correctly formatted.

Create a Mermaid diagram based on this description: ${prompt}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `API request failed with status ${response.status}`;
      throw new Error(errorMessage);
    }

    const data = await response.json();
    const generatedText = data.candidates[0]?.content?.parts[0]?.text?.trim();
    
    if (!generatedText) {
      throw new Error('No response received from Gemini API');
    }

    // Clean up the response - remove any markdown code blocks if present
    let cleanText = generatedText;
    
    // Remove markdown code blocks with backticks
    const codeBlockPattern = /```(?:mermaid)?\s*([\s\S]*?)```/g;
    const codeBlockMatch = codeBlockPattern.exec(cleanText);
    if (codeBlockMatch) {
      cleanText = codeBlockMatch[1].trim();
    }
    
    // Remove any remaining backticks
    cleanText = cleanText.replace(/`/g, '').trim();
    
    return cleanText;
  } catch (error) {
    console.error('Error in API call:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to generate diagram. Please try again later.');
  }
};

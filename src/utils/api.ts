
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
          maxOutputTokens: 4096,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `API request failed with status ${response.status}`;
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Full API response:', JSON.stringify(data, null, 2));
    
    // Check if the response has the expected structure
    if (!data.candidates || !Array.isArray(data.candidates) || data.candidates.length === 0) {
      console.error('Unexpected API response structure:', data);
      throw new Error('Invalid response format from Gemini API');
    }
    
    const candidate = data.candidates[0];
    console.log('First candidate:', JSON.stringify(candidate, null, 2));
    
    // Handle different possible response structures
    let generatedText = null;
    
    // Check for truncation or other issues
    if (candidate.finishReason === 'MAX_TOKENS') {
      console.error('Response was truncated due to token limit');
      // Try to extract partial content if available
      let partialText = null;
      if (candidate.content && Array.isArray(candidate.content.parts) && candidate.content.parts.length > 0) {
        partialText = candidate.content.parts[0].text?.trim();
      }
      
      if (partialText && (partialText.includes('graph') || partialText.includes('flowchart') || partialText.includes('sequenceDiagram'))) {
        console.log('Found partial diagram content, attempting to use it');
        // We'll continue processing the partial content
        generatedText = partialText;
      } else {
        throw new Error('Response was too long and was truncated. Please try a simpler prompt or try again.');
      }
    }
    
    if (candidate.finishReason === 'SAFETY') {
      console.error('Response was blocked due to safety filters');
      throw new Error('Response was blocked by safety filters. Please try a different prompt.');
    }
    
    if (candidate.finishReason === 'RECITATION') {
      console.error('Response was blocked due to recitation filters');
      throw new Error('Response was blocked due to recitation filters. Please try rephrasing your prompt.');
    }
    
    // Only extract text if we haven't already gotten it from a partial response
    if (!generatedText) {
      // Try the expected structure first
      if (candidate.content && Array.isArray(candidate.content.parts) && candidate.content.parts.length > 0) {
        generatedText = candidate.content.parts[0].text?.trim();
      }
      // Alternative structure: direct text in candidate
      else if (candidate.text) {
        generatedText = candidate.text.trim();
      }
      // Alternative structure: content as string
      else if (typeof candidate.content === 'string') {
        generatedText = candidate.content.trim();
      }
      // Alternative structure: content with text property
      else if (candidate.content && candidate.content.text) {
        generatedText = candidate.content.text.trim();
      }
    }
    
    if (!generatedText) {
      console.error('Could not extract text from candidate:', candidate);
      throw new Error('Invalid candidate format from Gemini API - no text found');
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
    
    // Sanitize Mermaid syntax - fix common issues with special characters
    // First, handle node labels with parentheses and special characters
    cleanText = cleanText.replace(/\[([^[\]]*\([^)]*\)[^[\]]*)\]/g, (match, content) => {
      // Replace problematic characters with safer alternatives
      let sanitized = content
        .replace(/"/g, '')
        .replace(/'/g, '')
        .replace(/\(/g, ' - ')
        .replace(/\)/g, '')
        .replace(/,/g, ' and ');
      return `[${sanitized.trim()}]`;
    });
    
    // Handle node patterns like G[Choose payment method (Card, Transfer, Wallet)]
    cleanText = cleanText.replace(/([A-Z])\[(.*?\(.*?\).*?)\]/g, (match, id, label) => {
      let sanitizedLabel = label
        .replace(/"/g, '')
        .replace(/'/g, '')
        .replace(/\(/g, ' - ')
        .replace(/\)/g, '')
        .replace(/,/g, ' and ');
      return `${id}[${sanitizedLabel.trim()}]`;
    });
    
    // Also handle any remaining problematic characters in square brackets
    cleanText = cleanText.replace(/\[([^[\]]*,[^[\]]*)\]/g, (match, content) => {
      const sanitized = content.replace(/,/g, ' and ');
      return `[${sanitized.trim()}]`;
    });
    
    // If this was a truncated response, try to complete the diagram
    if (candidate.finishReason === 'MAX_TOKENS') {
      console.log('Attempting to complete truncated diagram');
      
      // Check if the diagram ends abruptly and try to complete it
      if (cleanText.includes('load_dashboard') && !cleanText.includes('end')) {
        cleanText += '\n    load_dashboard --> end_node((End))\n    end_node((End)) --> stop[Stop]';
      }
      
      // Ensure the diagram has proper ending
      if (!cleanText.includes('End') && !cleanText.includes('end') && !cleanText.includes('Stop') && !cleanText.includes('stop')) {
        cleanText += '\n    end_node((End))';
      }
    }
    
    return cleanText;
  } catch (error) {
    console.error('Error in API call:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to generate diagram. Please try again later.');
  }
};

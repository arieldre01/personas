import { NextRequest, NextResponse } from 'next/server';

const OLLAMA_API_URL = process.env.OLLAMA_URL || 'http://localhost:11434/api/generate';
const MODEL = process.env.OLLAMA_MODEL || 'phi3:mini';

// System prompt for persona extraction
const EXTRACTION_PROMPT = `You are an expert at extracting persona information from documents.
Analyze the provided text and extract any information that could help define a workplace persona.

Return a JSON object with these fields (use null for fields you cannot determine):
{
  "name": "string or null",
  "title": "string or null - a descriptive nickname like 'The Data-Driven Analyst'",
  "role": "string or null - job title",
  "location": "string or null",
  "age": "number or null",
  "generation": "Gen Z or Gen Y or Gen X or Boomer or null",
  "tenure": "string or null - like '5 Years'",
  "quote": "string or null - a characteristic quote",
  "psychology": {
    "stress": "string or null - what causes stress",
    "motivation": "string or null - what drives them",
    "painPoints": ["array of strings"]
  },
  "communication": {
    "do": ["array of strings - communication tips"],
    "dont": ["array of strings - things to avoid"]
  },
  "missingFields": [
    {"field": "fieldName", "question": "Question to ask user to fill this field"}
  ]
}

Only include missingFields for essential fields that are missing (name, role, psychology.stress, psychology.motivation).
Return ONLY the JSON object, no other text.`;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Extract text based on file type
    let extractedText = '';
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.txt')) {
      extractedText = await file.text();
    } else if (fileName.endsWith('.docx') || fileName.endsWith('.pptx') || fileName.endsWith('.pdf')) {
      // For complex formats, we'll extract what we can
      // In a production app, you'd use libraries like pdf-parse, mammoth, etc.
      // For now, we'll try to read as text or return a helpful message
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      
      // Try to find readable text in the file
      let textContent = '';
      for (let i = 0; i < bytes.length; i++) {
        const char = bytes[i];
        // Only keep printable ASCII characters
        if (char >= 32 && char <= 126) {
          textContent += String.fromCharCode(char);
        } else if (char === 10 || char === 13) {
          textContent += '\n';
        }
      }
      
      // Clean up the text
      extractedText = textContent
        .replace(/[^\x20-\x7E\n]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (extractedText.length < 50) {
        return NextResponse.json({
          error: 'Could not extract readable text from this file. For best results, use a .txt file or paste the content directly.',
        }, { status: 400 });
      }
    } else {
      return NextResponse.json({
        error: `Unsupported file type. Supported types: .txt, .docx, .pptx, .pdf`,
      }, { status: 400 });
    }

    // Limit text length to avoid overwhelming the model
    const maxLength = 3000;
    if (extractedText.length > maxLength) {
      extractedText = extractedText.substring(0, maxLength) + '...';
    }

    // Use Ollama to extract persona information
    const prompt = `${EXTRACTION_PROMPT}

Text to analyze:
"""
${extractedText}
"""

JSON response:`;

    const response = await fetch(OLLAMA_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        prompt,
        stream: false,
        options: {
          temperature: 0.3,
          num_predict: 1000,
          num_ctx: 4096,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Ollama error:', errorText);
      return NextResponse.json({
        error: 'AI extraction failed. Make sure Ollama is running.',
      }, { status: 500 });
    }

    const data = await response.json();
    let generatedText = data.response?.trim() || '';

    // Try to parse the JSON response
    try {
      // Find JSON in the response (it might have extra text)
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        // Clean up the parsed data
        const persona = {
          name: parsed.name || '',
          title: parsed.title || '',
          role: parsed.role || '',
          location: parsed.location || '',
          age: parsed.age || 30,
          generation: parsed.generation || 'Gen Y',
          tenure: parsed.tenure || '',
          quote: parsed.quote || '',
          psychology: {
            stress: parsed.psychology?.stress || '',
            motivation: parsed.psychology?.motivation || '',
            painPoints: Array.isArray(parsed.psychology?.painPoints) 
              ? parsed.psychology.painPoints.filter((p: unknown) => typeof p === 'string' && p.trim())
              : [],
          },
          communication: {
            do: Array.isArray(parsed.communication?.do)
              ? parsed.communication.do.filter((d: unknown) => typeof d === 'string' && d.trim())
              : [],
            dont: Array.isArray(parsed.communication?.dont)
              ? parsed.communication.dont.filter((d: unknown) => typeof d === 'string' && d.trim())
              : [],
          },
        };

        // Determine missing fields
        const missingFields: Array<{ field: string; question: string }> = [];
        
        if (!persona.name) {
          missingFields.push({
            field: 'name',
            question: "What is this persona's name?",
          });
        }
        if (!persona.role) {
          missingFields.push({
            field: 'role',
            question: "What is their job role or title?",
          });
        }
        if (!persona.psychology.stress) {
          missingFields.push({
            field: 'psychology.stress',
            question: "What causes stress for this persona at work?",
          });
        }
        if (!persona.psychology.motivation) {
          missingFields.push({
            field: 'psychology.motivation',
            question: "What motivates this persona?",
          });
        }

        return NextResponse.json({
          persona,
          missingFields,
          extractedText: extractedText.substring(0, 200) + '...',
        });
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError, generatedText);
      return NextResponse.json({
        error: 'Failed to parse extracted information. Please try again or create manually.',
        rawResponse: generatedText.substring(0, 500),
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Extract persona error:', error);
    return NextResponse.json({
      error: 'Failed to process file',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}


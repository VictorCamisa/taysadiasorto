import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple PDF text extraction using pdf.js via CDN
async function extractTextFromPDF(pdfBytes: Uint8Array): Promise<string> {
  // Use a simple approach - convert PDF to text using basic parsing
  // For production, consider using a proper PDF parsing service
  
  const decoder = new TextDecoder('utf-8', { fatal: false });
  const pdfText = decoder.decode(pdfBytes);
  
  // Extract text between stream objects (basic PDF text extraction)
  const textContent: string[] = [];
  
  // Find text between BT and ET markers (Begin Text / End Text)
  const textMatches = pdfText.match(/BT[\s\S]*?ET/g) || [];
  
  for (const match of textMatches) {
    // Extract text from Tj and TJ operators
    const tjMatches = match.match(/\(([^)]*)\)\s*Tj/g) || [];
    for (const tj of tjMatches) {
      const text = tj.match(/\(([^)]*)\)/)?.[1] || '';
      if (text.trim()) {
        textContent.push(text);
      }
    }
    
    // Extract from TJ arrays
    const tjArrayMatches = match.match(/\[([^\]]*)\]\s*TJ/g) || [];
    for (const tjArray of tjArrayMatches) {
      const items = tjArray.match(/\(([^)]*)\)/g) || [];
      for (const item of items) {
        const text = item.slice(1, -1);
        if (text.trim()) {
          textContent.push(text);
        }
      }
    }
  }
  
  // If basic extraction fails, try to get readable text from the raw content
  if (textContent.length === 0) {
    // Look for text in content streams
    const streamMatches = pdfText.match(/stream[\s\S]*?endstream/g) || [];
    for (const stream of streamMatches) {
      // Extract printable characters
      const readable = stream.replace(/stream|endstream/g, '')
        .replace(/[^\x20-\x7E\n\r]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      if (readable.length > 50) { // Only add if meaningful content
        textContent.push(readable);
      }
    }
  }
  
  const result = textContent.join(' ').replace(/\s+/g, ' ').trim();
  
  // If still empty, return a message indicating extraction failed
  if (result.length < 10) {
    console.log('Basic PDF extraction yielded minimal text, PDF may be image-based or encrypted');
    return '';
  }
  
  return result;
}

// Chunk text into smaller pieces for embedding
function chunkText(text: string, chunkSize = 1000, overlap = 200): string[] {
  const chunks: string[] = [];
  
  if (!text || text.length === 0) {
    return chunks;
  }
  
  // Split by paragraphs first for better semantic chunks
  const paragraphs = text.split(/\n\n+/);
  let currentChunk = '';
  
  for (const paragraph of paragraphs) {
    if (currentChunk.length + paragraph.length > chunkSize) {
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
      }
      // Start new chunk with overlap from previous
      const words = currentChunk.split(' ');
      const overlapWords = words.slice(-Math.floor(overlap / 5));
      currentChunk = overlapWords.join(' ') + ' ' + paragraph;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  // If no natural paragraph breaks, chunk by character count
  if (chunks.length === 0 && text.length > 0) {
    for (let i = 0; i < text.length; i += chunkSize - overlap) {
      const chunk = text.slice(i, i + chunkSize);
      if (chunk.trim()) {
        chunks.push(chunk.trim());
      }
    }
  }
  
  return chunks;
}

// Create embeddings using OpenAI
async function createEmbedding(text: string, apiKey: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-ada-002',
      input: text.slice(0, 8000), // Limit input size
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI embedding error: ${error}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

// Fetch URL content
async function fetchUrlContent(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DocumentProcessor/1.0)',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status}`);
    }
    
    const contentType = response.headers.get('content-type') || '';
    
    if (contentType.includes('application/pdf')) {
      const pdfBytes = new Uint8Array(await response.arrayBuffer());
      return await extractTextFromPDF(pdfBytes);
    }
    
    const html = await response.text();
    
    // Basic HTML to text conversion
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
    
    return text;
  } catch (error) {
    console.error('Error fetching URL:', error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentId } = await req.json();
    
    if (!documentId) {
      throw new Error('Missing documentId');
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Processing document: ${documentId}`);

    // Update status to processing
    await supabase
      .from('ai_agent_documents')
      .update({ status: 'processing' })
      .eq('id', documentId);

    // Fetch document
    const { data: doc, error: docError } = await supabase
      .from('ai_agent_documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (docError || !doc) {
      throw new Error(`Document not found: ${docError?.message}`);
    }

    let textContent = '';

    // Get content based on document type
    if (doc.type === 'text') {
      textContent = doc.content || '';
    } else if (doc.type === 'url') {
      console.log(`Fetching URL: ${doc.source_url}`);
      textContent = await fetchUrlContent(doc.source_url);
    } else if (doc.type === 'pdf') {
      // Download from storage
      console.log(`Downloading PDF: ${doc.file_path}`);
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('agent-documents')
        .download(doc.file_path);
      
      if (downloadError) {
        throw new Error(`Failed to download file: ${downloadError.message}`);
      }
      
      const pdfBytes = new Uint8Array(await fileData.arrayBuffer());
      textContent = await extractTextFromPDF(pdfBytes);
      
      if (!textContent) {
        // Update with error about image-based PDF
        await supabase
          .from('ai_agent_documents')
          .update({ 
            status: 'error',
            error_message: 'PDF appears to be image-based or encrypted. Text extraction failed.'
          })
          .eq('id', documentId);
        
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'PDF text extraction failed - document may be image-based' 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    if (!textContent || textContent.length < 10) {
      await supabase
        .from('ai_agent_documents')
        .update({ 
          status: 'error',
          error_message: 'No text content could be extracted from the document'
        })
        .eq('id', documentId);
      
      return new Response(
        JSON.stringify({ success: false, error: 'No content extracted' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Extracted ${textContent.length} characters`);

    // Update document with extracted content
    await supabase
      .from('ai_agent_documents')
      .update({ content: textContent })
      .eq('id', documentId);

    // Chunk the text
    const chunks = chunkText(textContent);
    console.log(`Created ${chunks.length} chunks`);

    // Delete existing chunks for this document
    await supabase
      .from('ai_agent_document_chunks')
      .delete()
      .eq('document_id', documentId);

    // Process each chunk
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      console.log(`Processing chunk ${i + 1}/${chunks.length}`);
      
      // Create embedding
      const embedding = await createEmbedding(chunk, OPENAI_API_KEY);
      
      // Store chunk with embedding
      const { error: insertError } = await supabase
        .from('ai_agent_document_chunks')
        .insert({
          document_id: documentId,
          agent_id: doc.agent_id,
          chunk_index: i,
          content: chunk,
          embedding: JSON.stringify(embedding),
          metadata: {
            source: doc.name,
            type: doc.type,
            chunk_number: i + 1,
            total_chunks: chunks.length,
          },
        });

      if (insertError) {
        console.error(`Error inserting chunk ${i}:`, insertError);
      }
    }

    // Update document status
    await supabase
      .from('ai_agent_documents')
      .update({ 
        status: 'ready',
        chunk_count: chunks.length,
        error_message: null,
      })
      .eq('id', documentId);

    console.log(`Document processing complete: ${chunks.length} chunks created`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        chunks: chunks.length,
        characters: textContent.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing document:', error);
    
    // Try to update document status to error
    try {
      const { documentId } = await req.clone().json();
      if (documentId) {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        await supabase
          .from('ai_agent_documents')
          .update({ 
            status: 'error',
            error_message: error instanceof Error ? error.message : 'Unknown error',
          })
          .eq('id', documentId);
      }
    } catch (e) {
      console.error('Failed to update error status:', e);
    }
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

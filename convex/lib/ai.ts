export async function generateEmbedding(text: string): Promise<number[]> {
  // TODO: Integrate with OpenAI or Ollama
  // For now, return a random vector of 1536 dimensions for testing plumbing
  console.log("Generating embedding for:", text.substring(0, 20) + "...");
  return Array.from({ length: 1536 }, () => Math.random());
}

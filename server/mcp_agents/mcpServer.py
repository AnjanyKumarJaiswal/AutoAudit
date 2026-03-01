import re
import json
import asyncio
from typing import List, Dict, Any
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from mcp import types
from mcp.server.lowlevel import Server

app = Server("mcp-server")


def _split_into_chunks(text: str, chunk_size: int = 200, overlap: int = 50) -> List[str]:
    words = text.split()
    chunks = []
    for i in range(0, len(words), chunk_size - overlap):
        chunk = " ".join(words[i : i + chunk_size])
        if chunk.strip():
            chunks.append(chunk.strip())
    return chunks


def search_company_docs(query: str, documents: List[Dict[str, str]], top_k: int = 5) -> List[Dict[str, Any]]:
    if not documents or not query.strip():
        return []

    corpus = []
    chunk_metadata = []

    for doc in documents:
        chunks = _split_into_chunks(doc["raw_text"])
        if not chunks:
            chunks = [doc["raw_text"]]

        for chunk in chunks:
            corpus.append(chunk)
            chunk_metadata.append({
                "document": doc["filename"],
                "text": chunk,
            })

    if not corpus:
        return []

    try:
        vectorizer = TfidfVectorizer(
            stop_words="english",
            max_features=5000,
            ngram_range=(1, 2),
        )
        tfidf_matrix = vectorizer.fit_transform(corpus)
        query_vec = vectorizer.transform([query])

        similarities = cosine_similarity(query_vec, tfidf_matrix).flatten()

        top_indices = similarities.argsort()[-top_k:][::-1]

        results = []
        for idx in top_indices:
            score = float(similarities[idx])
            if score > 0.01:
                results.append({
                    "document": chunk_metadata[idx]["document"],
                    "snippet": chunk_metadata[idx]["text"],
                    "relevance_score": round(score, 4),
                })

        return results

    except Exception as e:
        return _fallback_keyword_search(query, documents, top_k)


def _fallback_keyword_search(query: str, documents: List[Dict[str, str]], top_k: int = 5) -> List[Dict[str, Any]]:
    keywords = set(query.lower().split())
    results = []

    for doc in documents:
        text_lower = doc["raw_text"].lower()
        match_count = sum(1 for kw in keywords if kw in text_lower)

        if match_count > 0:
            sentences = re.split(r"[.!?\n]", doc["raw_text"])
            best_sentence = ""
            best_score = 0

            for sentence in sentences:
                sent_lower = sentence.lower()
                score = sum(1 for kw in keywords if kw in sent_lower)
                if score > best_score:
                    best_score = score
                    best_sentence = sentence.strip()

            results.append({
                "document": doc["filename"],
                "snippet": best_sentence[:500] if best_sentence else doc["raw_text"][:500],
                "relevance_score": round(match_count / max(len(keywords), 1), 4),
            })

    results.sort(key=lambda x: x["relevance_score"], reverse=True)
    return results[:top_k]


@app.list_tools()
async def list_tools() -> list[types.Tool]:
    return [
        types.Tool(
            name="search_company_docs",
            description=(
                "Search through the company's uploaded reference documents to find "
                "information relevant to a given query. Returns matching text snippets "
                "with their source document names and relevance scores. Use this tool "
                "to find specific information needed to answer questionnaire questions."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "The search query — use keywords or a natural language question to find relevant information in the reference documents.",
                    }
                },
                "required": ["query"],
            },
        )
    ]


@app.call_tool()
async def call_tool(name: str, arguments: dict) -> list[types.TextContent]:
    if name == "search_company_docs":
        query = arguments.get("query", "")
        documents = arguments.get("documents", [])
        results = search_company_docs(query, documents)
        return [types.TextContent(type="text", text=json.dumps(results))]
    else:
        raise ValueError(f"Unknown tool: {name}")


if __name__ == "__main__":
    from mcp.server.stdio import stdio_server
    
    async def main():
        async with stdio_server() as (read_stream, write_stream):
            await app.run(
                read_stream,
                write_stream,
                app.create_initialization_options()
            )

    asyncio.run(main())


import json
from typing import Dict, Any, List
from mcp.gemini import GeminiClient, gemini_client
from mcp.mcpServer import TOOLS, handle_tool_call


SYSTEM_PROMPT = """You are an AI compliance analyst. You answer questionnaire questions ONLY using the provided reference documents.

STRICT RULES:
1. Use the search_company_docs tool to find relevant information for each question.
2. Base your answer ONLY on the search results returned by the tool. Do NOT use external knowledge or make up information.
3. If the tool returns no relevant results or the results don't contain enough information to answer the question, you MUST respond with status "not_found".
4. Include citations referencing the specific document names.
5. Keep answers concise but complete (2-4 sentences).
6. Extract exact text snippets from the search results as evidence.

You MUST respond with ONLY a valid JSON object (no markdown, no code fences) in this exact format:
{
    "answer": "Your answer text here. Reference sources inline like [Source: document_name.txt].",
    "citations": [{"doc": "document_name.txt", "snippet": "brief description of what was cited"}],
    "evidence_snippets": [{"doc": "document_name.txt", "text": "exact text excerpt from the document"}],
    "status": "answered"
}

If the question cannot be answered from references:
{
    "answer": "Not found in references.",
    "citations": [],
    "evidence_snippets": [],
    "status": "not_found"
}"""

MAX_TOOL_ROUNDS = 3


def answer_question(question: str, documents: List[Dict[str, str]]) -> Dict[str, Any]:
    chat = gemini_client.create_chat(
        tools=TOOLS,
        system_prompt=SYSTEM_PROMPT,
    )

    tool_context = {"documents": documents}

    message = f"Please answer the following questionnaire question using ONLY the reference documents available through your tools:\n\nQuestion: {question}"
    response = gemini_client.send_message(chat, message)

    if "error" in response:
        return _error_result(question, response["error"])

    rounds = 0
    while response.get("tool_calls") and rounds < MAX_TOOL_ROUNDS:
        rounds += 1

        for tool_call in response["tool_calls"]:
            tool_name = tool_call["name"]
            tool_args = tool_call["arguments"]

            tool_result = handle_tool_call(tool_name, tool_args, tool_context)

            response = gemini_client.send_tool_result(chat, tool_name, tool_result)

            if "error" in response:
                return _error_result(question, response["error"])

    if response.get("text"):
        return _parse_ai_response(response["text"], question)

    return _error_result(question, "No response from AI")


def _parse_ai_response(text: str, question: str) -> Dict[str, Any]:
    try:
        cleaned = text.strip()
        if cleaned.startswith("```"):
            first_newline = cleaned.index("\n")
            cleaned = cleaned[first_newline + 1:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()

        result = json.loads(cleaned)

        return {
            "answer": result.get("answer", ""),
            "citations": result.get("citations", []),
            "evidence_snippets": result.get("evidence_snippets", []),
            "status": result.get("status", "answered"),
        }

    except (json.JSONDecodeError, ValueError):
        return {
            "answer": text.strip(),
            "citations": [],
            "evidence_snippets": [],
            "status": "answered",
        }


def _error_result(question: str, error: str) -> Dict[str, Any]:
    return {
        "answer": f"Error generating answer: {error}",
        "citations": [],
        "evidence_snippets": [],
        "status": "not_found",
    }

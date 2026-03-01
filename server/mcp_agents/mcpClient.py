import json
import os
import sys
import asyncio
from typing import Dict, Any, List

from mcp import ClientSession
from mcp.client.stdio import stdio_client, StdioServerParameters
from mcp_agents.gemini import GeminiClient, gemini_client

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
    return asyncio.run(_async_answer_question(question, documents))


async def _async_answer_question(question: str, documents: List[Dict[str, str]]) -> Dict[str, Any]:
    server_path = os.path.join(os.path.dirname(__file__), "mcpServer.py")
    server_params = StdioServerParameters(
        command=sys.executable,
        args=[server_path],
    )

    try:
        async with stdio_client(server_params) as (read_stream, write_stream):
            async with ClientSession(read_stream, write_stream) as session:
                await session.initialize()
                
                tools_response = await session.list_tools()
                
                gemini_tools = []
                for tool in tools_response.tools:
                    gemini_tools.append({
                        "name": tool.name,
                        "description": tool.description,
                        "inputSchema": tool.inputSchema,
                    })

                chat = gemini_client.create_chat(
                    tools=gemini_tools,
                    system_prompt=SYSTEM_PROMPT,
                )

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

                        # Inject the specific reference documents context because Gemini doesn't know them
                        tool_args["documents"] = documents

                        tool_result = await session.call_tool(tool_name, tool_args)
                        
                        if tool_result.content and len(tool_result.content) > 0:
                            result_data = json.loads(tool_result.content[0].text)
                        else:
                            result_data = []

                        response = gemini_client.send_tool_result(chat, tool_name, result_data)

                        if "error" in response:
                            return _error_result(question, response["error"])

                if response.get("text"):
                    return _parse_ai_response(response["text"], question)

                return _error_result(question, "No response from AI")
    except Exception as e:
        return _error_result(question, f"MCP Client Error: {str(e)}")


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

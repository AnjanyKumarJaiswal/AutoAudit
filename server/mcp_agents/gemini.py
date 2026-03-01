import os
from typing import Dict, Any, List
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY not found in environment variables")


class GeminiClient:
    
    def __init__(self, model_name: str = "gemini-3-flash-preview"):
        self.model_name = model_name
        self.client = genai.Client(api_key=GEMINI_API_KEY)
    
    def _fix_schema(self, schema: dict) -> dict:
        if not isinstance(schema, dict):
            return schema
        
        if schema.get("type") == "array" and "items" not in schema:
            schema["items"] = {"type": "string"}
        
        if "properties" in schema and isinstance(schema["properties"], dict):
            for key, prop in schema["properties"].items():
                schema["properties"][key] = self._fix_schema(prop)
        
        if "items" in schema and isinstance(schema["items"], dict):
            schema["items"] = self._fix_schema(schema["items"])
        
        return schema

    def create_tools_config(self, tools: List[Dict]) -> List[types.Tool]:
        function_declarations = []
        
        for tool in tools:
            input_schema = tool.get("inputSchema", {"type": "object", "properties": {}})
            input_schema = self._fix_schema(input_schema)
            
            function_declarations.append(
                types.FunctionDeclaration(
                    name=tool["name"],
                    description=tool["description"],
                    parameters=input_schema
                )
            )
        
        return [types.Tool(function_declarations=function_declarations)]
    
    def create_chat(self, tools: List[Dict], system_prompt: str = ""):
        config = types.GenerateContentConfig(
            system_instruction=system_prompt if system_prompt else None,
            tools=self.create_tools_config(tools) if tools else None,
            temperature=0.7,
        )
        
        return self.client.chats.create(
            model=self.model_name,
            config=config
        )
    
    def send_message(self, chat, message: str) -> Dict[str, Any]:
        try:
            response = chat.send_message(message)
            
            result = {"text": None, "tool_calls": []}
            
            if response.candidates and response.candidates[0].content:
                for part in response.candidates[0].content.parts:
                    if part.text:
                        result["text"] = part.text
                    
                    if part.function_call:
                        fc = part.function_call
                        result["tool_calls"].append({
                            "name": fc.name,
                            "arguments": dict(fc.args) if fc.args else {}
                        })
            
            return result
        except Exception as e:
            return {"error": str(e)}
    
    def send_tool_result(self, chat, tool_name: str, tool_result: Any) -> Dict[str, Any]:
        try:
            function_response = types.Part.from_function_response(
                name=tool_name,
                response={"result": tool_result}
            )
            
            response = chat.send_message(function_response)
            
            result = {"text": None, "tool_calls": []}
            
            if response.candidates and response.candidates[0].content:
                for part in response.candidates[0].content.parts:
                    if part.text:
                        result["text"] = part.text
                    
                    if part.function_call:
                        fc = part.function_call
                        result["tool_calls"].append({
                            "name": fc.name,
                            "arguments": dict(fc.args) if fc.args else {}
                        })
            
            return result
        except Exception as e:
            return {"error": str(e)}


gemini_client = GeminiClient()

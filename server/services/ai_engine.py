
from typing import List, Dict, Any
from db import db
from models.qa_pair import QAPair
from models.reference_doc import ReferenceDoc
from mcp_agents.mcpClient import answer_question


def generate_answers_for_project(
    qa_pairs: List[QAPair],
    ref_docs: List[ReferenceDoc],
    version_id: int,
) -> List[Dict[str, Any]]:
    documents = [
        {"filename": doc.filename, "raw_text": doc.raw_text}
        for doc in ref_docs
    ]

    results = []

    for qa in qa_pairs:
        try:
            ai_result = answer_question(qa.original_question, documents)

            qa.ai_answer = ai_result.get("answer", "")
            qa.citations = ai_result.get("citations", [])
            qa.evidence_snippets = ai_result.get("evidence_snippets", [])
            qa.status = ai_result.get("status", "answered")
            qa.version_id = version_id
            qa.is_edited = False

            db.session.add(qa)

            results.append({
                "question_number": qa.question_number,
                "question": qa.original_question,
                "answer": qa.ai_answer,
                "citations": qa.citations,
                "evidence_snippets": qa.evidence_snippets,
                "status": qa.status,
            })

        except Exception as e:
            qa.ai_answer = f"Error: {str(e)}"
            qa.status = "not_found"
            qa.version_id = version_id
            db.session.add(qa)

            results.append({
                "question_number": qa.question_number,
                "question": qa.original_question,
                "answer": qa.ai_answer,
                "citations": [],
                "evidence_snippets": [],
                "status": "not_found",
            })

    db.session.commit()

    return results

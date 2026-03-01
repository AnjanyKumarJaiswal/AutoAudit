# AutoAudit

Automate your questionnaire tasks in one go with AI agents.

> **Live Demo**: [auto-audit-anjany.vercel.app](https://auto-audit-anjany.vercel.app/)
> **GitHub**: [github.com/AnjanyKumarJaiswal/AutoAudit](https://github.com/AnjanyKumarJaiswal/AutoAudit)

## Industry & Context Setup

- **Industry**: FinTech / B2B SaaS
- **Fictional Company**: **FinTrust Solutions**
- **Description**: FinTrust Solutions provides a highly secure, cloud-based payment processing and reconciliation platform for enterprise businesses. Because we handle sensitive financial data, our infrastructure is built around stringent compliance, robust data privacy, and high operational reliability.

## Approach & Architecture Decision

When designing AutoAudit, I evaluated two distinct approaches before writing a single line of code:

### Approach 1 — Traditional RAG Pipeline (Considered & Rejected)

The standard approach for document Q&A systems is a **Retrieval-Augmented Generation (RAG)** pipeline:

1. Ingest reference documents and split them into chunks.
2. Convert each chunk into a vector embedding using a model like `text-embedding-ada-002`.
3. Store those embeddings in a vector database (ChromaDB, Pinecone, etc.).
4. At query time, embed the question, run a similarity search to retrieve the top-k relevant chunks, and pass those chunks as context to the LLM for a final answer.

**Why I moved away from this:** RAG is powerful at scale, but it introduces significant infrastructure complexity — you need an embedding model, a vector store, a chunking strategy, and a retrieval tuning layer — all before you've answered a single question. For a questionnaire answering tool where the document corpus per project is small and well-defined, this overhead is engineering cost without proportionate product benefit.

### Approach 2 — AI Agents via MCP (Chosen)

Instead, I built AutoAudit around an **AI Agent architecture** using the **Model Context Protocol (MCP)**. The agent is given the full text of all reference documents alongside the question as structured context. Rather than pre-computing relevance through embeddings, the LLM itself performs the reasoning — reading, extracting, and citing inline.

**Why this is better for this use case:**

- **Simpler, faster to build**: No embedding pipeline, no vector DB, no chunking logic to tune.
- **More accurate for small corpora**: With a small, focused set of reference docs (as in any single audit project), direct context injection outperforms chunked retrieval because the model sees the full picture without retrieval noise.
- **Structured, auditable outputs**: The MCP agent returns a strict JSON schema — `answer`, `citations`, `evidence_snippets`, `status` — making every output grounded, traceable, and display-ready.
- **Agentic extensibility**: The MCP architecture makes it trivial to extend the system with new tools (e.g., a web search tool, a SQL lookup tool) in future without restructuring the core pipeline.

The trade-off is that this approach doesn't scale to very large corpora (e.g., thousands of internal wiki pages). That is intentionally noted in the Trade-offs section below, with Vector RAG listed as the next step for a production-scale version.

## What was Built

AutoAudit is an end-to-end platform built with a Next.js frontend and a Flask backend. It allows users to:

1. Create projects and upload structured questionnaires (CSV, PDF, etc.) alongside reference documents.
2. Use an integrated AI engine (via an MCP agent) to automatically answer each question based _strictly_ on the provided reference documents.
3. Review answers, see extraction snippets (evidence), and manually edit or regenerate specific answers.
4. Export the final results into a cleanly formatted DOCX report that preserves the original questions.

## Assumptions

- Questionnaires are semi-structured (e.g., one question per line or basic CSV format).
- Reference documents are text-heavy and can be cleanly parsed into plain text without losing critical context (like complex image-based charts).
- The total text size of the reference documents for a single project fits within the AI model's context window.

## Trade-offs

- **Direct Context vs. Vector RAG**: To optimize for clarity and implementation speed, reference documents are injected directly into the AI's context. A production scenario with gigabytes of references would require a Vector database (RAG) approach, which was skipped here to reduce architectural overhead.
- **Synchronous Generation**: The answer generation runs synchronously over the HTTP request. While there is UI feedback, a very large questionnaire might timeout. A background queue (like Celery + Redis + WebSockets) would be preferred for production.
- **Database / Deployment**: While local SQLite can be used for rapid local testing, the production deployment utilizes an external cloud MySQL database (Aiven) connected to the Flask backend (Render) via SQLAlchemy. This ensures the live demo handles persistent state correctly across ephemeral container restarts.

## What I would improve with more time

1. **Confidence Scores**: Prompt the AI to output a confidence score (0-100%) for each answer so the UI can flag low-confidence answers for mandatory human review.
2. **Complex Formatting**: Enhance the DOCX export to handle more complex layouts and include direct hyperlinks to source documents.

## Sample Data

A `sample_data/` directory is included containing a set of FinTrust Solutions reference policies and a `.csv` questionnaire for easy testing.

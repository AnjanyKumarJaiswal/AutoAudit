# AutoAudit

Automate your questionnaire tasks in one go with AI agents.

## Industry & Context Setup

- **Industry**: FinTech / B2B SaaS
- **Fictional Company**: **FinTrust Solutions**
- **Description**: FinTrust Solutions provides a highly secure, cloud-based payment processing and reconciliation platform for enterprise businesses. Because we handle sensitive financial data, our infrastructure is built around stringent compliance, robust data privacy, and high operational reliability.

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
- **Database**: Uses local SQL storage to ensure the project is easy to run out-of-the-box for evaluators without needing external database provisioning.

## What I would improve with more time

1. **Confidence Scores**: Prompt the AI to output a confidence score (0-100%) for each answer so the UI can flag low-confidence answers for mandatory human review.
2. **Complex Formatting**: Enhance the DOCX export to handle more complex layouts and include direct hyperlinks to source documents.

## Sample Data

A `sample_data/` directory is included containing a set of FinTrust Solutions reference policies and a `.csv` questionnaire for easy testing.

# Crunchbot

**Crunchbot** is a conversational NFT analytics chatbot powered by **Gemini 2.0 Flash** and real-time data from the **bitsCrunch API**. Ask natural questions like _"Who are the top whales in 0xabc...?"_ or _"Show washtrade stats for 0xabc..."_ and Crunchbot will return smart, structured NFT insights.

---

### Live Link : [Live](https://crunchbot-five.vercel.app/)
### Video Link : [Video](https://youtu.be/KcX73TfiRtw)

## ✨ Features

- **Chat UI**: Type natural language queries like:
  - _"Show top whales for 0xbc4c..."_
  - _"Is 0xabc... NFT collection being wash traded?"_
  - _"What is the floor price and trader volume for 0xbc4c...?"_

- **LLM Intent Parsing**: Uses **Gemini 2.0 Flash** to:
  - Understand user query
  - Identify the correct bitsCrunch endpoint (e.g. `whales`, `scores`)
  - Generate API query parameters (e.g. `contract_address`, `limit`, `time_range`)

- **bitsCrunch Integration**: Live NFT analytics using:
  - `collection-whales`
  - `collection-scores`
  - `collection-washtrade`
  - `collection-metadata`
  - and more (traders, analytics, holders, categories...)

- **Smart Routing**:
  - Dynamic routing to internal handlers based on Gemini response
  - No duplicate logic – endpoints reuse `/api/bitscrunch/*.ts`

- **Query Normalization**:
  - Ensures `contract_address`, `limit`, etc., are safely formatted
  - Prevents malformed queries or crashes

- **Modular & Scalable Codebase**:
  - Clean API folder structure
  - Easily extendable with more endpoints or chains

---

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, MongoDB, Mongoose
- **Authentication**: JWT, bcryptjs
- **AI**: Google Gemini API
- **Charts**: Chart.js, react-chartjs-2
- **Markdown**: react-markdown

## Screenshots

<img width="2841" height="2210" alt="Screenshot 2025-07-31 at 01-25-11 " src="https://github.com/user-attachments/assets/bff725fe-750f-4349-a8c3-4fe5a107b119" />

<img width="2841" height="3703" alt="Screenshot 2025-07-31 at 01-34-07 " src="https://github.com/user-attachments/assets/796abd16-61eb-460e-8c6d-43c1e7d35e5b" />


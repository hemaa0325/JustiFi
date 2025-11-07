# JustiFi: Instant Micro-Loans for the Underserved Using Receipts and Behavior

## Problem Statement

Millions of gig workers and small merchants in India lack access to formal credit because they don't have a CIBIL score or traditional documents. But they do have digital receipts, UPI transactions, and behavioral patterns that can prove their trustworthiness.

## Our Solution

A mobile-first app that lets users upload receipts or connect mock transaction data. It calculates a credit score using advanced AI algorithms, then gives an instant loan approval or rejection with a clear explanation — all while protecting user privacy.

## What We'll Build (MVP Scope)

### Frontend (Mobile/Web App)

Simple UI with:

- Onboarding + consent screen
- Upload receipts or "Use demo data" button
- Result screen: score, decision, reason, and loan offer
- Transaction history (simulated disbursement)
- Privacy badge ("No PAN/Aadhaar required")

### Backend (API + Logic)

#### `/assess` endpoint:

- Accepts receipt data (JSON or image)
- Extracts features (e.g., number of receipts, average amount)
- Applies advanced AI scoring algorithms
- Integrates with external credit bureaus for comprehensive analysis
- Returns: score, top reasons, decision, offer

#### `/disburse` endpoint:

- Simulates loan disbursement
- Adds a transaction to user history
- Returns updated balance and repayment plan

### Advanced AI Scoring Engine

Enhanced machine learning-based logic with multiple data sources:

#### Core Scoring Components:
- **Income Stability Analysis**: Evaluates consistency and reliability of income sources
- **Spending Pattern Recognition**: Identifies responsible spending behaviors
- **Debt-to-Income Ratio**: Assesses financial obligations relative to income
- **Credit History Integration**: Combines internal analysis with external bureau data
- **Employment Verification**: Validates employment through document analysis
- **Savings Behavior**: Evaluates financial responsibility through savings patterns
- **Transaction Volume Analysis**: Measures account activity and engagement

#### External Data Integration:
- Real-time credit bureau data integration
- Multi-bureau scoring aggregation
- Dynamic risk assessment based on current market conditions

Score range: 0–100

Decision logic:

- Score ≥ 80 → APPROVE full amount (up to $20,000)
- 65–79 → APPROVE_WITH_CAP (up to $15,000)
- 50–64 → APPROVE_WITH_CAP (up to $8,000)
- 30–49 → REVIEW (manual assessment required)
- <30 → REJECT

### Mock Data

3 demo users:

- Low-risk: many receipts, steady income
- Medium-risk: some receipts, irregular income
- High-risk: few receipts, recent refund

Mock receipts: JSON files with date, amount, merchant

## Privacy Features

- No real ID or PAN required
- Masked receipt previews (e.g., hide phone numbers)
- All scoring done locally or on mock backend
- "Why we approved/rejected you" explanation

## Team Roles

- Frontend: UI screens, receipt upload, result display
- Backend: API, scoring logic, mock disbursement
- Pitch/Demo: Storytelling, persona scripts, fallback video

## What Makes Us Stand Out

- Explainable AI score: "Why we approved you" in plain English
- Privacy-first: no PAN, no CIBIL, no full ID
- Realistic demo: simulate full loan lifecycle
- Social impact: helps real people, not just tech showcase
- Advanced analytics: leverages cutting-edge AI for better decision making
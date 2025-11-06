# JustiFi: Instant Micro-Loans for the Underserved Using Receipts and Behavior

## Problem Statement

Millions of gig workers and small merchants in India lack access to formal credit because they don't have a CIBIL score or traditional documents. But they do have digital receipts, UPI transactions, and behavioral patterns that can prove their trustworthiness.

## Our Solution

A mobile-first app that lets users upload receipts or connect mock transaction data. It calculates a credit score using simple rules, then gives an instant loan approval or rejection with a clear explanation — all while protecting user privacy.

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
- Applies scoring rules
- Returns: score, top reasons, decision, offer

#### `/disburse` endpoint:

- Simulates loan disbursement
- Adds a transaction to user history
- Returns updated balance and repayment plan

### Scoring Engine

Rule-based logic (fast to build and explain):

- +10 points for steady income
- +8 for 4+ receipts in 2 weeks
- -15 for recent refunds

Score range: 0–100

Decision logic:

- Score ≥ 80 → APPROVE full amount
- 60–79 → APPROVE_WITH_CAP
- 45–59 → REVIEW
- <45 → REJECT

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

- Explainable score: "Why we approved you" in plain English
- Privacy-first: no PAN, no CIBIL, no full ID
- Realistic demo: simulate full loan lifecycle
- Social impact: helps real people, not just tech showcase

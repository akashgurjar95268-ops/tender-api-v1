// This is the core AI Tender Filter API
import axios from 'axios';

// Get API Keys and Threshold from Vercel Environment Variables
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID; // Kept for reference, though unused
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET; // Kept for reference, though unused
const AI_TENDER_THRESHOLD = parseFloat(process.env.AI_TENDER_THRESHOLD || 0.85); // Threshold for AI filtering

// GitHub URL for Raw Tender Data (Replace this URL with your actual data source)
const TENDER_DATA_URL = 'https://raw.githubusercontent.com/akashgurjar95268-ops/tender-api-v1/main/tenders.json';
const PLAN_ID = 'plan_Oomphxq6tC5t7n'; // Your Razorpay Plan ID (Kept for reference, though unused)


export default async function handler(req, res) {
    // 1. Get User Input (Query)
    const { query, user_id } = req.query;

    if (!query) {
        return res.status(400).json({ error: 'Query parameter is required.' });
    }

    // NOTE: Subscription Check (Razorpay) logic has been removed for testing.
    // The API will now proceed directly to filtering logic.

    // 2. AI Filtering Logic (Simulated for setup)
    try {
        // Fetch the large tender data
        const tenderResponse = await axios.get(TENDER_DATA_URL);
        const allTenders = tenderResponse.data;

        // Simulate AI filtering based on the query
        const keywords = query.toLowerCase().split(' ').filter(k => k.length > 2); // Get keywords from query

        const filteredTenders = allTenders.filter(tender => {
            // Simple simulation: Check if the query keywords are in title or description
            const content = `${tender.title} ${tender.description}`.toLowerCase();
            let matchCount = 0;

            keywords.forEach(keyword => {
                if (content.includes(keyword)) {
                    matchCount++;
                }
            });

            // The AI_TENDER_THRESHOLD controls the relevance score needed (0.0 to 1.0)
            const relevanceScore = matchCount / keywords.length;

            // Only return tenders that meet the threshold
            return relevanceScore >= AI_TENDER_THRESHOLD;
        });

        // 3. Send Success Response
        return res.status(200).json({
            success: true,
            query: query,
            threshold: AI_TENDER_THRESHOLD,
            results_count: filteredTenders.length,
            filtered_tenders: filteredTenders.slice(0, 10), // Limit to 10 for quick testing
        });

    } catch (error) {
        console.error('Filtering Error:', error.message);
        return res.status(500).json({ error: 'Failed to process tender filtering.' });
    }
              }

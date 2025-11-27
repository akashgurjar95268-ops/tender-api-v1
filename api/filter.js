// This is the core AI Tender Filter API
import axios from 'axios';

// Get API Keys from Vercel Environment Variables
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const AI_TENDER_THRESHOLD = parseFloat(process.env.AI_TENDER_THRESHOLD || '0.8');

// GitHub URL for Raw Tender Data
const TENDER_DATA_URL = 'https://raw.githubusercontent.com/tender-scraper/tender-data/main/data.json';
const PLAN_ID = 'plan_OomphXq6tC5t7n'; // Your Razorpay Plan ID

export default async function handler(req, res) {
  // 1. Get User Input (Query)
  const { query, user_id } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required.' });
  }

  // 2. Subscription Check (Razorpay)
  if (user_id) {
    try {
      // Check if user has an active subscription
      const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');
      const subscriptionResponse = await axios.get(
        `https://api.razorpay.com/v1/subscriptions?customer_id=${user_id}&plan_id=${PLAN_ID}&status=active`,
        {
          headers: {
            Authorization: `Basic ${auth}`,
          },
        }
      );

      const activeSubscriptions = subscriptionResponse.data.items.filter(
        (sub) => sub.status === 'active' || sub.status === 'authenticated'
      );

      if (activeSubscriptions.length === 0) {
        return res.status(403).json({ error: 'Subscription Required: No active subscription found for this user.' });
      }

    } catch (error) {
      console.error('Razorpay Error:', error.response ? error.response.data : error.message);
      // Fallback for errors: show subscription required (prevents unauthorized access)
      return res.status(403).json({ error: 'Subscription Required: Could not verify user subscription.' });
    }
  } else {
    // If no user_id is provided, require subscription
    return res.status(403).json({
      error: 'Subscription Required: Please provide a valid user_id to access the API.',
      info: {
        access_url: `https://tender-api-v1.vercel.app/subscribe?plan_id=${PLAN_ID}`,
        documentation: 'Link to your API documentation here'
      }
    });
  }

  // 3. AI Filtering Logic (Simulated for setup)
  try {
    // Fetch the large tender data
    const tenderResponse = await axios.get(TENDER_DATA_URL);
    const allTenders = tenderResponse.data;

    // Simulate AI filtering based on the query and threshold
    const filteredTenders = allTenders.filter(tender => {
        // Simple simulation: Check if the query is in the tender description or title
        const content = `${tender.title} ${tender.description}`.toLowerCase();
        const keywords = query.toLowerCase().split(' ');
        
        let matchCount = 0;
        keywords.forEach(keyword => {
            if (content.includes(keyword)) {
                matchCount++;
            }
        });

        // The AI_TENDER_THRESHOLD controls the relevance.
        const relevanceScore = matchCount / keywords.length;

        // Only return tenders that meet the set relevance threshold
        return relevanceScore >= AI_TENDER_THRESHOLD;
    });

    // 4. Send Filtered Results
    res.status(200).json({ 
      success: true, 
      query: query,
      threshold: AI_TENDER_THRESHOLD,
      results_count: filteredTenders.length,
      filtered_tenders: filteredTenders.slice(0, 10) // Limit to 10 for quick testing
    });

  } catch (error) {
    console.error('Filtering Error:', error.message);
    res.status(500).json({ error: 'Failed to process tender filtering.' });
  }
                                              }

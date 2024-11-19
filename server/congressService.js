import fetch from 'node-fetch';

const CONGRESS_API_KEY = process.env.CONGRESS_API_KEY;
const CONGRESS_API_BASE = 'https://api.congress.gov/v3';

export async function fetchCongressionalActivity() {
    try {
        // Fetch recent bills
        const billsUrl = `${CONGRESS_API_BASE}/bill?api_key=${CONGRESS_API_KEY}&format=json&limit=20&sort=updateDate+desc`;
        const billsResponse = await fetch(billsUrl);
        
        if (!billsResponse.ok) {
            throw new Error(`Congress API bills request failed: ${billsResponse.status}`);
        }
        
        const billsData = await billsResponse.json();
        
        // Fetch recent votes
        const votesUrl = `${CONGRESS_API_BASE}/vote?api_key=${CONGRESS_API_KEY}&format=json&limit=20&sort=updateDate+desc`;
        const votesResponse = await fetch(votesUrl);
        
        if (!votesResponse.ok) {
            throw new Error(`Congress API votes request failed: ${votesResponse.status}`);
        }
        
        const votesData = await votesResponse.json();
        
        // Process and combine the data
        const activities = {
            bills: billsData.bills.map(bill => ({
                id: bill.billNumber,
                type: 'bill',
                title: bill.title,
                introducedDate: bill.introducedDate,
                sponsor: bill.sponsors?.[0]?.name || 'Unknown Sponsor',
                latestAction: bill.latestAction?.text || 'No action recorded',
                congress: bill.congress,
                url: bill.url
            })),
            votes: votesData.votes.map(vote => ({
                id: vote.rollNumber,
                type: 'vote',
                chamber: vote.chamber,
                date: vote.date,
                question: vote.question,
                result: vote.result,
                totalYea: vote.totalYea,
                totalNay: vote.totalNay,
                url: vote.url
            }))
        };

        return activities;
    } catch (error) {
        console.error('Error fetching congressional activity:', error);
        throw error;
    }
}

export async function fetchMemberDetails(memberId) {
    try {
        const url = `${CONGRESS_API_BASE}/member/${memberId}?api_key=${CONGRESS_API_KEY}&format=json`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Congress API member request failed: ${response.status}`);
        }
        
        const data = await response.json();
        return {
            id: memberId,
            name: data.member.name,
            party: data.member.party,
            state: data.member.state,
            district: data.member.district,
            terms: data.member.terms,
            sponsoredLegislation: data.member.sponsoredLegislation
        };
    } catch (error) {
        console.error(`Error fetching member details for ${memberId}:`, error);
        throw error;
    }
}

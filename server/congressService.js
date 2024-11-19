import fetch from 'node-fetch';
import { CONGRESS_API_KEY } from './config.js';

export async function fetchCongressionalActivity() {
    try {
        // Fetch recent bills
        const billsUrl = `https://api.congress.gov/v3/bill/118/introduced?api_key=${CONGRESS_API_KEY}&format=json&limit=20&sort=updateDate+desc`;
        const billsResponse = await fetch(billsUrl);
        
        if (!billsResponse.ok) {
            throw new Error(`Congress API bills request failed: ${billsResponse.status}`);
        }
        
        const billsData = await billsResponse.json();
        
        // Fetch recent votes from the House
        const votesUrl = `https://api.congress.gov/v3/house/votes/2024?api_key=${CONGRESS_API_KEY}&format=json&limit=20`;
        const votesResponse = await fetch(votesUrl);
        
        if (!votesResponse.ok) {
            throw new Error(`Congress API votes request failed: ${votesResponse.status}`);
        }
        
        const votesData = await votesResponse.json();
        
        // Process and combine the data
        const activities = {
            bills: billsData.bills?.map(bill => ({
                id: bill.number || bill.billNumber,
                type: 'bill',
                title: bill.title || bill.shortTitle || 'Untitled Bill',
                introducedDate: bill.introducedDate,
                sponsor: bill.sponsor?.name || bill.sponsors?.[0]?.name || 'Unknown Sponsor',
                latestAction: bill.latestAction?.text || bill.actions?.[0]?.text || 'No action recorded',
                congress: bill.congress,
                url: `https://www.congress.gov/bill/${bill.congress}th-congress/${bill.type.toLowerCase()}/${bill.number}`
            })) || [],
            votes: votesData.votes?.map(vote => ({
                id: vote.rollNumber || vote.rollCall,
                type: 'vote',
                chamber: vote.chamber || 'House',
                date: vote.date || vote.updateDate,
                question: vote.question || vote.description || 'Unknown Question',
                result: vote.result,
                totalYea: vote.total?.yeas || vote.yeas || 0,
                totalNay: vote.total?.nays || vote.nays || 0,
                url: `https://www.congress.gov/roll-call-vote/${vote.congress}/${vote.session}/${vote.chamber.toLowerCase()}/${vote.rollNumber}`
            })) || []
        };

        return activities;
    } catch (error) {
        console.error('Error fetching congressional activity:', error);
        throw error;
    }
}

export async function fetchMemberDetails(memberId) {
    try {
        const url = `https://api.congress.gov/v3/member/${memberId}?api_key=${CONGRESS_API_KEY}&format=json`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Congress API member request failed: ${response.status}`);
        }
        
        const data = await response.json();
        return {
            id: memberId,
            name: data.member?.name || 'Unknown Member',
            party: data.member?.party || 'Unknown Party',
            state: data.member?.state || 'Unknown State',
            district: data.member?.district || 'N/A',
            terms: data.member?.terms || [],
            sponsoredLegislation: data.member?.sponsoredLegislation || []
        };
    } catch (error) {
        console.error(`Error fetching member details for ${memberId}:`, error);
        throw error;
    }
}

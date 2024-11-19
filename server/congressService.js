import fetch from 'node-fetch';
import { CONGRESS_API_KEY } from './config.js';

export async function fetchCongressionalActivity() {
    try {
        // Fetch recent bills
        const billsUrl = `https://api.congress.gov/v3/bill/118/introduced?api_key=${CONGRESS_API_KEY}&format=json&limit=20&offset=0`;
        console.log('Fetching bills from:', billsUrl.replace(CONGRESS_API_KEY, 'HIDDEN'));
        const billsResponse = await fetch(billsUrl);
        
        if (!billsResponse.ok) {
            const errorText = await billsResponse.text();
            console.error('Bills API Error:', errorText);
            throw new Error(`Congress API bills request failed: ${billsResponse.status} - ${errorText}`);
        }
        
        const billsData = await billsResponse.json();
        console.log('Bills response:', JSON.stringify(billsData, null, 2));
        
        // Fetch recent votes from the House
        const votesUrl = `https://api.congress.gov/v3/house/votes/2024/1?api_key=${CONGRESS_API_KEY}&format=json&limit=20&offset=0`;
        console.log('Fetching votes from:', votesUrl.replace(CONGRESS_API_KEY, 'HIDDEN'));
        const votesResponse = await fetch(votesUrl);
        
        if (!votesResponse.ok) {
            const errorText = await votesResponse.text();
            console.error('Votes API Error:', errorText);
            throw new Error(`Congress API votes request failed: ${votesResponse.status} - ${errorText}`);
        }
        
        const votesData = await votesResponse.json();
        console.log('Votes response:', JSON.stringify(votesData, null, 2));
        
        // Process and combine the data
        const activities = {
            bills: billsData?.bills?.map(bill => ({
                id: bill.number || bill.billNumber || 'Unknown',
                type: 'bill',
                title: bill.title || bill.shortTitle || 'Untitled Bill',
                introducedDate: bill.introducedDate,
                sponsor: bill.sponsor?.name || 'Unknown Sponsor',
                latestAction: bill.latestAction?.text || 'No action recorded',
                congress: bill.congress || '118',
                url: bill.url || `https://www.congress.gov/bill/118th-congress/house-bill/${bill.number}`
            })) || [],
            votes: votesData?.votes?.vote?.map(vote => ({
                id: vote.rollCall || 'Unknown',
                type: 'vote',
                chamber: 'House',
                date: vote.updateDate || vote.date,
                question: vote.question || vote.description || 'Unknown Question',
                result: vote.result || 'Pending',
                totalYea: vote.totals?.yea || vote.yeas || 0,
                totalNay: vote.totals?.nay || vote.nays || 0,
                url: vote.url || `https://www.congress.gov/roll-call-vote/118-1/house/${vote.rollCall}`
            })) || []
        };

        console.log('Processed activities:', JSON.stringify(activities, null, 2));
        return activities;
    } catch (error) {
        console.error('Error in fetchCongressionalActivity:', error);
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

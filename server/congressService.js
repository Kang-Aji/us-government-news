import fetch from 'node-fetch';
import { CONGRESS_API_KEY } from './config.js';

export async function fetchCongressionalActivity() {
    try {
        // Fetch recent bills from both House and Senate
        const houseBillsUrl = `https://api.congress.gov/v3/bill/118/hr?api_key=${CONGRESS_API_KEY}&format=json&limit=10&offset=0`;
        console.log('Fetching House bills from:', houseBillsUrl.replace(CONGRESS_API_KEY, 'HIDDEN'));
        const houseBillsResponse = await fetch(houseBillsUrl);
        
        if (!houseBillsResponse.ok) {
            const errorText = await houseBillsResponse.text();
            console.error('House Bills API Error:', errorText);
            throw new Error(`Congress API House bills request failed: ${houseBillsResponse.status} - ${errorText}`);
        }
        
        const houseBillsData = await houseBillsResponse.json();
        console.log('House Bills response:', JSON.stringify(houseBillsData, null, 2));

        const senateBillsUrl = `https://api.congress.gov/v3/bill/118/s?api_key=${CONGRESS_API_KEY}&format=json&limit=10&offset=0`;
        console.log('Fetching Senate bills from:', senateBillsUrl.replace(CONGRESS_API_KEY, 'HIDDEN'));
        const senateBillsResponse = await fetch(senateBillsUrl);
        
        if (!senateBillsResponse.ok) {
            const errorText = await senateBillsResponse.text();
            console.error('Senate Bills API Error:', errorText);
            throw new Error(`Congress API Senate bills request failed: ${senateBillsResponse.status} - ${errorText}`);
        }
        
        const senateBillsData = await senateBillsResponse.json();
        console.log('Senate Bills response:', JSON.stringify(senateBillsData, null, 2));
        
        // Fetch recent votes
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
        const allBills = [
            ...(houseBillsData.bills || []).map(bill => ({
                ...bill,
                chamber: 'House',
                type: 'hr'
            })),
            ...(senateBillsData.bills || []).map(bill => ({
                ...bill,
                chamber: 'Senate',
                type: 's'
            }))
        ];

        const activities = {
            bills: allBills.map(bill => ({
                id: bill.number || 'Unknown',
                type: 'bill',
                title: bill.title || bill.shortTitle || 'Untitled Bill',
                introducedDate: bill.introducedDate,
                sponsor: bill.sponsor?.name || 'Unknown Sponsor',
                chamber: bill.chamber,
                latestAction: bill.latestAction?.text || 'No action recorded',
                congress: '118',
                url: `https://www.congress.gov/bill/118th-congress/${bill.type}/${bill.number}`
            })).sort((a, b) => new Date(b.introducedDate) - new Date(a.introducedDate)),
            votes: (votesData.votes || []).map(vote => ({
                id: vote.rollCall || 'Unknown',
                type: 'vote',
                chamber: 'House',
                date: vote.date || vote.updateDate,
                question: vote.question || vote.description || 'Unknown Question',
                result: vote.result || 'Pending',
                totalYea: vote.totals?.yea || vote.yeas || 0,
                totalNay: vote.totals?.nay || vote.nays || 0,
                url: `https://www.congress.gov/roll-call-vote/118-1/house/${vote.rollCall}`
            }))
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

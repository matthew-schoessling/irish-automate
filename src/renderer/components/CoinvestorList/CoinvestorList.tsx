import { useState, useEffect } from 'react'; 
import './CoinvestorList.css';
import { baseUrl, headers} from '../../../helpers/constants';
import { Coinvestor, Option, Opportunity, User, CustomField } from '../../../helpers/types';
import CoinvestorCard from '../CoinvestorCard/CoinvestorCard';

interface CoinvestorListProps {
    coinvestorRatingsOptions: Option[];
    selectedOpportunity: Opportunity | undefined;
    customFieldsDict: Record<number, CustomField>;
}

function CoinvestorList({coinvestorRatingsOptions, selectedOpportunity, customFieldsDict}: CoinvestorListProps) {
    const [coinvestors, setCoinvestors] = useState<Coinvestor[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const industries = customFieldsDict[648465].options;

    useEffect(() => {
        const fetchCoinvestorData = async () => {
            const coinvestorUrl = baseUrl + '/companies/search';
            const userUrl = baseUrl + '/users/search';
            // No efficient way to get total coinvestors in Copper, so use a total pages that is much greater than actual amount total pages
            const totalPages = 10;

            try {
                const coinvestorRequest = Array.from({ length: totalPages}, (_, i) =>
                    fetch(coinvestorUrl, {
                        method: "POST",
                        headers: headers,
                        body: JSON.stringify(
                            { 
                                page_size: 200, 
                                page_number: i + 1, 
                                contact_type_ids: [987287] // 987287 is the ID for the Coinvestor Contact Type 
                            }
                        )
                    }).then((res) => res.json())
                );

                const coinvestorData = await Promise.all(coinvestorRequest);
                const companies: Coinvestor[] = coinvestorData.flatMap((result) => 
                    result.map((ci: Coinvestor) => ({ 
                        id: ci.id, 
                        name: ci.name, 
                        custom_fields: ci.custom_fields, 
                        opportunityMatchRank: 0, 
                        assignee_id: ci.assignee_id,
                        matchingCriteria: [],
                        nonmatchingCriteria: []
                })) // returning Coinvestor objects
                ).filter(ci => ci.name != null);
                setCoinvestors(companies);
                
                // Request for Current Users in Copper (IrishAngels team that has access to Copper)
                const usersRequest = await fetch(userUrl, {
                    method: "POST",
                    headers: headers,
                    body: JSON.stringify({
                        page_size: 10,
                        page_number: 1
                    })
                });

                const usersData = await usersRequest.json();
                setUsers(usersData);

            } catch (error) {
                console.log('Error: ', error);
            }
        };
        
        if (coinvestors.length == 0)
            fetchCoinvestorData();
    }, [])

    useEffect(() => {
        // If selected opportunity is undefined, return as we can't re-rank the coinvestors
        if (selectedOpportunity == undefined)
            return;
        
        const oppRoundSize = selectedOpportunity.custom_fields.find(cf => cf.custom_field_definition_id===666330)
        const oppIndustryExpertise = selectedOpportunity.custom_fields.find(cf => cf.custom_field_definition_id===648465)
        
        // Reset all ranks to 0, and rank all coinvestors based on how well it matches Selected Opportunity
        setCoinvestors(prevCoinvestors =>
            prevCoinvestors.map(c => {
                let rank = 0
                let checkSizeMatch = false;
                let matchingCriteria = [];
                let nonmatchingCriteria = [];

                // If Owner field is a current Copper User, +1 for that coinvestor
                if (users.find(u => u.id === c.assignee_id) !== undefined) {
                    rank++;
                    matchingCriteria.push("Owner");
                } else {
                    nonmatchingCriteria.push("Owner");
                }
                
                // If Round Size of the Opportunity falls within a range of the coinvestor, +1
                const checkSizes = c.custom_fields.find(cf => cf.custom_field_definition_id === 648463)

                if (checkSizes?.value && oppRoundSize) {
                    const csList = checkSizes.value as number[];
                    if (typeof csList === 'object')
                    {
                        csList.map((cs: number) => {
                            // 1931252 = <$100,000, 1931253 = $100,000 - $500,000, 1931254 = $500,000 - $1,000,000, 1931255 = >$1,000,000
                            if ( 
                                !checkSizeMatch && (
                                    (cs === 1931252 && oppRoundSize.value <= 100000) || 
                                    (cs === 1931253 && oppRoundSize.value >= 100000 && oppRoundSize.value <= 500000) ||
                                    (cs === 1931253 && oppRoundSize.value >= 500000 && oppRoundSize.value <= 1000000) || 
                                    (cs === 1931255 && oppRoundSize.value >= 1000000)
                                )
                            ) {
                                rank++;
                                checkSizeMatch = true;
                            }
                        });
                        if (checkSizeMatch)
                            matchingCriteria.push("Round Size");
                        else
                            nonmatchingCriteria.push("Round Size");
                    }
                }

                // If Stage of the Opportunity matches stages of coinvestor, +1 (hold off to check on Stage)

                // If Region of the Opportunity matches region focus of coinvestor, +1 (hold off to check in on region)

                // Foreach industry matched between opportunity and coinvestor, +1
                var listCoinvestorIndustries = c.custom_fields.find(cf => cf.custom_field_definition_id===648465)
                var coinvestorIndustriesSet = new Set(listCoinvestorIndustries?.value)

                if (coinvestorIndustriesSet.size !== 0) {
                    // If Coinvestor is agnostic, +1
                    if (coinvestorIndustriesSet.has(1931259)) {
                        rank++;
                        matchingCriteria.push("Agnostic");
                    }

                    // For every sector of the opportunity, if the Coinvestor is specifically experted in that sector, +1
                    oppIndustryExpertise?.value.map((oppIndustry: number) => {
                        const industryName = industries?.find(i => i.id===oppIndustry)?.name;
                        if (coinvestorIndustriesSet.has(oppIndustry)) {
                            rank++;
                            matchingCriteria.push(industryName);
                        } else {
                            nonmatchingCriteria.push(industryName);
                        }
                    })
                }

                // Return Coinvestor value with its new rank
                return {
                    ...c,
                    opportunityMatchRank: rank,
                    matchingCriteria: matchingCriteria,
                    nonmatchingCriteria: nonmatchingCriteria
                }
            })
        );
    }, [selectedOpportunity]);


    return (
        <div className="coinvestor-container">
            <div className="coinvestor-header">
                Potential Coinvestors
            </div>
            <div className="coinvestor-list-container">
                {coinvestors
                    .slice()
                    .sort((a,b) => {
                        //if (b.opportunityMatchRank !== a.opportunityMatchRank) // waiting for star ordering
                          return b.opportunityMatchRank - a.opportunityMatchRank
                    })
                    .map((coinvestor, index) => (
                        <CoinvestorCard 
                            key={`coinvestor-${index}`} 
                            coinvestor={coinvestor} 
                            rankCustomField={coinvestor.custom_fields?.find(cf => cf.custom_field_definition_id===648777)} 
                            coinvestorRatingsOptions={coinvestorRatingsOptions}
                        />
                    ))
                }
            </div>
        </div>
    )
}

export default CoinvestorList;
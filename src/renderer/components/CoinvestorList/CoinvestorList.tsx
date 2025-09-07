import { useState, useEffect } from 'react'; 
import './CoinvestorList.css';
import { Coinvestor, Option, Opportunity, User, CustomField, Person } from '../../../helpers/types';
import { fetchCoinvestors, fetchIrishAngelsUserData } from '../../../helpers/methods';
import CoinvestorCard from '../CoinvestorCard/CoinvestorCard';

interface CoinvestorListProps {
    coinvestorRatingsOptions: Option[];
    selectedOpportunity: Opportunity | undefined;
    opportunityStagesOfInvestment: number[];
    opportunityGeographicalFocus: number[];
    industryOptions: Option[];
    setEmailList: React.Dispatch<React.SetStateAction<Person[]>>;
    emailList: Person[];
    coinvestors: Coinvestor[];
    setCoinvestors: React.Dispatch<React.SetStateAction<Coinvestor[]>>;
    users: User[]
}

function CoinvestorList({
    coinvestorRatingsOptions, 
    selectedOpportunity,
    opportunityStagesOfInvestment, 
    opportunityGeographicalFocus, 
    industryOptions,
    setEmailList,
    emailList,
    coinvestors,
    setCoinvestors,
    users
}: CoinvestorListProps) {
    let pauseRender = false;

    useEffect(() => {
        pauseRender = true;
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
                const coinvestorCheckSizes = c.custom_fields.find(cf => cf.custom_field_definition_id === 648463)

                if (coinvestorCheckSizes?.value && oppRoundSize?.value) {
                    const csList = coinvestorCheckSizes.value as number[];
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
                } else {
                    nonmatchingCriteria.push("Round Size");
                }

                // If Stage of the Opportunity matches stages of coinvestor, +1
                const coinvestorStages = c.custom_fields.find(cf => cf.custom_field_definition_id === 648461)?.value as number[];

                if (coinvestorStages) {
                    // This variable will track if the coinvestor specifically doesn't invest in the region of the Opportunity
                    var stageMatch = false;
                    coinvestorStages.map((coinvestorStage: number) => {
                        if (opportunityStagesOfInvestment.includes(coinvestorStage))
                            stageMatch = true;
                    })

                    if (stageMatch){
                        rank++;
                        matchingCriteria.push("Stage of Investment");
                    } else {
                        nonmatchingCriteria.push("Stage of Investment");
                    }
                }

                // If Region of the Opportunity matches region focus of coinvestor, +1
                const coinvestorGeographicalFocuses = c.custom_fields.find(cf => cf.custom_field_definition_id === 648462)?.value as number[];

                if (coinvestorGeographicalFocuses) {
                    var antiRegionMatch = false;
                    var regionMatch = false;
                    coinvestorGeographicalFocuses.map((region: number) => {
                        if (region === 1931247)
                            regionMatch = true;
                        // If coinvestor specified No Bay Area and the opportunity is in the bay area
                        else if (region === 1931250 && opportunityGeographicalFocus.includes(2059887))
                            antiRegionMatch = true;
                        // If the coinvestor specified No Coasts, and the opportunity includes Bay Area, East Coast, or West Coast 
                        else if (region === 1931251 && (opportunityGeographicalFocus.includes(2059887) || opportunityGeographicalFocus.includes(1931248) || opportunityGeographicalFocus.includes(1931244)))
                            antiRegionMatch = true; 
                    })
                    if (regionMatch && !antiRegionMatch) {
                        rank++;
                        matchingCriteria.push("Geographical Focus");
                    } else {
                        nonmatchingCriteria.push("Geographical Focus");
                    }
                }

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
                        const industryName = industryOptions?.find(i => i.id===oppIndustry)?.name;
                        if (oppIndustry != 1931259) {
                            if (coinvestorIndustriesSet.has(oppIndustry)) {
                                rank++;
                                matchingCriteria.push(industryName);
                            } else {
                                nonmatchingCriteria.push(industryName);
                            }
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
        pauseRender = false;
    }, [selectedOpportunity]);

    if (!selectedOpportunity || pauseRender) return null;

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
                            industryOptions={industryOptions}
                            setEmailList={setEmailList}
                            emailList={emailList}
                        />
                    ))
                }
            </div>
        </div>
    )
}

export default CoinvestorList;
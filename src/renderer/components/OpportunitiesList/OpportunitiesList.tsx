import { useState, useEffect } from 'react'; 
import './OpportunitiesList.css';
import { Coinvestor, Opportunity, Option } from '../../../helpers/types';
import OpportunityCard from '../OpportunityCard/OpportunityCard';

interface OpportunityListProps {
    selectedCoinvestor: Coinvestor | undefined;
    opportunities: Opportunity[];
    setOpportunities: React.Dispatch<React.SetStateAction<Opportunity[]>>;
    oppEmailList: Opportunity[];
    setOppEmailList: React.Dispatch<React.SetStateAction<Opportunity[]>>;
    industryOptions: Option[];
}

function OpportunitiesList({
    selectedCoinvestor,
    opportunities,
    setOpportunities,
    oppEmailList,
    setOppEmailList,
    industryOptions
}: OpportunityListProps) {
    let pauseRender = false;

    useEffect(() => {
        pauseRender = true;
        // If selected opportunity is undefined, return as we can't re-rank the coinvestors
        if (selectedCoinvestor == undefined)
            return;

        setOpportunities(prevOpportunities => 
            prevOpportunities.map(opp => {
                let rank = 0;
                let checkSizeMatch = false;
                let matchingCriteria = [];
                let nonmatchingCriteria = [];

                // Round Size
                const oppRoundSize = opp.custom_fields.find(cf => cf.custom_field_definition_id===666330);
                const coinvestorCheckSizes = selectedCoinvestor.custom_fields.find(cf => cf.custom_field_definition_id === 648463);

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
                const coinvestorStages = selectedCoinvestor.custom_fields.find(cf => cf.custom_field_definition_id === 648461)?.value as number[];
                var opportunityStagesOfInvestment = opp.custom_fields.find(cf => cf.custom_field_definition_id === 648461)?.value ?? [];

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
                const coinvestorGeographicalFocuses = selectedCoinvestor.custom_fields.find(cf => cf.custom_field_definition_id === 648462)?.value as number[];
                const opportunityGeographicalFocus = opp.custom_fields.find(cf => cf.custom_field_definition_id === 648462)?.value as number[]

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
                var listCoinvestorIndustries = selectedCoinvestor.custom_fields.find(cf => cf.custom_field_definition_id===648465)
                var listOppIndustries = opp.custom_fields.find(cf => cf.custom_field_definition_id===648465)
                var coinvestorIndustriesSet = new Set(listCoinvestorIndustries?.value)

                if (coinvestorIndustriesSet.size !== 0) {
                    // If Coinvestor is agnostic, +1
                    if (coinvestorIndustriesSet.has(1931259)) {
                        rank++;
                        matchingCriteria.push("Agnostic");
                    }

                    // For every sector of the opportunity, if the Coinvestor is specifically experted in that sector, +1
                    listOppIndustries?.value.map((oppIndustry: number) => {
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
                opp.coinvestorMatchRank = rank;
                opp.matchingCriteria = matchingCriteria;
                opp.nonmatchingCriteria = nonmatchingCriteria;

                return opp;
            })
        )
        
        pauseRender = false;
    }, [selectedCoinvestor]);

    if (!selectedCoinvestor || pauseRender) return null;

    return (
        <div className="opportunity-container">
            <div className="opportunity-header">
                Potential Opportunities
            </div>
            <div className="opportunity-list-container">
                {opportunities
                    .filter(opp => opp.status === "Open" && opp.pipeline_id === 470884) // 470884 relates to the Deal Flow/Portfolio Opportunities for IrishAngels
                    .sort((a,b) => {
                          return b.coinvestorMatchRank - a.coinvestorMatchRank
                    })
                    .map((opportunity, index) => (
                        <OpportunityCard 
                            key={`opportuniy-${index}`} 
                            opportunity={opportunity}
                            oppEmailList={oppEmailList}
                            setOppEmailList={setOppEmailList}
                        />
                    ))
                }
            </div>
        </div>
    )
}

export default OpportunitiesList;
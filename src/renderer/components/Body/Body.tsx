import { useState, useEffect } from 'react';
import OpportunityInfo from '../OpportunityInfo/OpportunityInfo';
import SelectorExportContainer from '../SelectorExportContainer/SelectorExportContainer';
import CoinvestorList from '../CoinvestorList/CoinvestorList';
import EmailList from '../EmailList/EmailList';
import { Opportunity, Stage, CustomField, Person } from '../../../helpers/types';
import { baseUrl, headers } from '../../../helpers/constants';
import './Body.css'; 

function Body(){
    const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity>();
    const [stage, setStage] = useState<Stage>();
    const [industry, setIndustry] = useState<string>('');
    const [customFieldsDict, setCustomFieldsDict] = useState<Record<number, CustomField>>({});
    const [contact, setContact] = useState<Person>();
    const [emailRecipients, setEmailRecipients] = useState<Person[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const customFieldsUrl = `${baseUrl}/custom_field_definitions`;
        
            try {
                const customFieldsResponse = await fetch(customFieldsUrl, {
                    method: 'GET',
                    headers: headers
                });

                const customFieldsData = await customFieldsResponse.json() as CustomField[];

                // Make dictionary of custom fields
                const customFieldsDict = customFieldsData?.reduce((acc, cf) => {
                    acc[cf.id] = cf;
                    return acc;
                }, {} as Record<number, CustomField>);
        
                setCustomFieldsDict(customFieldsDict);
            } catch (error) {
                console.log('Error: ', error);
            }
        }
        
        if (Object.keys(customFieldsDict).length === 0)
            fetchData()
    }, []);

    // 648777 is the id for the "Coinvestor Rating" fields that exists on Companies in Copper, 
    // giving a rating of 1-4 stars for each coinvestor
    const coinvestorRatingsOptions = customFieldsDict ? customFieldsDict[648777]?.options : [];

    // 648461 is the id for the "Stage of Investment" field that exists on both Opportunity and Company in Copper
    const stagesOfInvestmentOptions = customFieldsDict ? customFieldsDict[648461]?.options : [];

    // 648462 is the id for the "Geographical Focus" field that exists on both Opportunity and Company in Copper
    const geographicalFocusOptions = customFieldsDict ? customFieldsDict[648462]?.options : [];

    // 648465 is the id for the "Industry" field that exists on both Opportunity and Company in Copper
    const industryOptions = customFieldsDict ? customFieldsDict[648465]?.options : [];

    // Use the custom field ids of Stage and Geographical Focus to get the list of ids on the selected opportunity
    var opportunityStagesOfInvestment = selectedOpportunity?.custom_fields.find(cf => cf.custom_field_definition_id === 648461)?.value ?? [];
    var opportunityGeographicalFocus = selectedOpportunity?.custom_fields.find(cf => cf.custom_field_definition_id === 648462)?.value ?? [];

    return(
        <div className="body-class">
            <SelectorExportContainer
                setSelectedOpportunity={setSelectedOpportunity}
                setStage={setStage}
                setIndustry={setIndustry}
                setContact={setContact}
                selectedOpportunity={selectedOpportunity}
                customFieldsDict={customFieldsDict}
                contact={contact}
                industryOptions={industryOptions || []}
            />
            <OpportunityInfo
                selectedOpportunity={selectedOpportunity}
                stage={stage}
                industry={industry}
                stageOfInvestmentOptions={stagesOfInvestmentOptions || []}
                geographicalFocusOptions={geographicalFocusOptions || []}
            />
            <CoinvestorList 
                coinvestorRatingsOptions={coinvestorRatingsOptions || []}
                selectedOpportunity={selectedOpportunity}
                opportunityStagesOfInvestment={opportunityStagesOfInvestment}
                opportunityGeographicalFocus={opportunityGeographicalFocus}
                stageOfInvestmentOptions={stagesOfInvestmentOptions || []}
                geographicalFocusOptions={geographicalFocusOptions || []}
                industryOptions={industryOptions || []}
                setEmailList={setEmailRecipients}
                emailList={emailRecipients}
            />
            <EmailList setEmailList={setEmailRecipients} emailRecipients={emailRecipients}/>
        </div>
    );
};

export default Body;
import { useState, useEffect } from 'react';
import OpportunityInfo from '../OpportunityInfo/OpportunityInfo';
import SelectorExportContainer from '../SelectorExportContainer/SelectorExportContainer';
import CoinvestorList from '../CoinvestorList/CoinvestorList';
import EmailList from '../EmailList/EmailList';
import CoinvestorSelector from '../CoinvestorSelector/CoinvestorSelector';
import CoinvestorInfo from '../CoinvestorInfo/CoinvestorInfo';
import OpportunitiesList from '../OpportunitiesList/OpportunitiesList';
import OppEmailList from '../OppEmailList/OppEmailList';
import { Opportunity, Stage, CustomField, Person, Coinvestor, User } from '../../../helpers/types';
import { fetchCustomFieldDefinitions, fetchOpportunities, fetchPipelineStages, fetchCoinvestors, fetchIrishAngelsUserData } from '../../../helpers/methods';
import './Body.css'; 

interface BodyProps {
    isOpportunityView: boolean
}

function Body({isOpportunityView} : BodyProps){
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [stages, setStages] = useState<Stage[]>([]);
    const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity>();
    const [coinvestors, setCoinvestors] = useState<Coinvestor[]>([]);
    const [selectedCoinvestor, setSelectedCoinvestor] = useState<Coinvestor>();
    const [users, setUsers] = useState<User[]>([]);
    const [stage, setStage] = useState<Stage>();
    const [industry, setIndustry] = useState<string>('');
    const [customFieldsDict, setCustomFieldsDict] = useState<Record<number, CustomField>>({});
    const [contact, setContact] = useState<Person>();
    const [emailRecipients, setEmailRecipients] = useState<Person[]>([]);
    const [oppEmailList, setOppEmailList] = useState<Opportunity[]>([]);
    const [opportunitiesSelected, setOpportunitiesSelected] = useState<Opportunity[]>([]);

    useEffect(() => {

        const fetchData = async () => {
            // Fetch all custom fields from Copper. Custom fields are configured in Settings > Manage Customizations
            // We use the custom field definitions to 1. identify the field and 2. identify the value for custom fields on entities
            var customFieldsDictTemp = undefined;
            if (Object.keys(customFieldsDict).length === 0)
                customFieldsDictTemp = await fetchCustomFieldDefinitions(setCustomFieldsDict);

            var usersTemp = undefined;
            if (users.length === 0)
                usersTemp = await fetchIrishAngelsUserData(setUsers);

            // Fetch all opportunities from Copper
            if (opportunities.length === 0)
                await fetchOpportunities(setOpportunities);

            // Fetch all coinvestors from Copper        
            if (coinvestors.length === 0)
                await fetchCoinvestors(setCoinvestors, customFieldsDictTemp, users);

            // Fetch Pipeline Stages in Copper
            if (stages.length === 0)
                await fetchPipelineStages(setStages);
        }

        fetchData();
    }, []);

    // 648777 is the id for the "Coinvestor Rating" fields that exists on Companies in Copper, 
    // giving a rating of 1-4 stars for each coinvestor
    const coinvestorRatingsOptions = customFieldsDict ? customFieldsDict[648777]?.options : [];

    // 648461 is the id for the "Stage of Investment" field that exists on both Opportunity and Company in Copper
    const stagesOfInvestmentOptions = customFieldsDict ? customFieldsDict[648461]?.options : [];

    // 648462 is the id for the "Geographical Focus" field that exists on both Opportunity and Company in Copper
    const geographicalFocusOptions = customFieldsDict ? customFieldsDict[648462]?.options : [];

    // 247906 is the id for the "Round Structure" field that exists on the Opportunity in Copper
    const roundStructureOptions = customFieldsDict ? customFieldsDict[247906]?.options : [];

    // 648465 is the id for the "Industry" field that exists on both Opportunity and Company in Copper
    const industryOptions = customFieldsDict ? customFieldsDict[648465]?.options : [];

    // Use the custom field ids of Stage and Geographical Focus to get the list of ids on the selected opportunity
    var opportunityStagesOfInvestment = selectedOpportunity?.custom_fields.find(cf => cf.custom_field_definition_id === 648461)?.value ?? [];
    var opportunityGeographicalFocus = selectedOpportunity?.custom_fields.find(cf => cf.custom_field_definition_id === 648462)?.value ?? [];

    return(
        <div className="body-class">
            { isOpportunityView
            ?
                <>
                    <SelectorExportContainer
                        setSelectedOpportunity={setSelectedOpportunity}
                        setStage={setStage}
                        setIndustry={setIndustry}
                        setContact={setContact}
                        selectedOpportunity={selectedOpportunity}
                        customFieldsDict={customFieldsDict}
                        contact={contact}
                        industryOptions={industryOptions || []}
                        opportunities={opportunities}
                        stages={stages}
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
                        setEmailList={setEmailRecipients}
                        emailList={emailRecipients}
                        coinvestors={coinvestors}
                        setCoinvestors={setCoinvestors}
                        industryOptions={industryOptions ?? []}
                        users={users}
                    />
                    <EmailList 
                        setEmailList={setEmailRecipients} 
                        emailRecipients={emailRecipients} 
                        selectedOpportunity={selectedOpportunity} 
                        stageOfInvestmentOptions={stagesOfInvestmentOptions || []}
                        roundStructureOptions={roundStructureOptions || []}
                        industryOptions={industryOptions || []}
                        mainContact={contact}
                    />
                </>
            :
                <>
                    <CoinvestorSelector
                        setSelectedCoinvestor={setSelectedCoinvestor}
                        coinvestors={coinvestors}
                    />
                    <CoinvestorInfo
                        selectedCoinvestor={selectedCoinvestor}
                    />
                    <OpportunitiesList
                        selectedCoinvestor={selectedCoinvestor}
                        opportunities={opportunities}
                        setOpportunities={setOpportunities}
                        oppEmailList={oppEmailList}
                        setOppEmailList={setOppEmailList}
                        industryOptions={industryOptions ?? []}
                    />
                    <OppEmailList
                        oppEmailList={oppEmailList}
                        setOppEmailList={setOppEmailList}
                        selectedCoinvestor={selectedCoinvestor} 
                        setEmailRecipients={setEmailRecipients}
                        emailRecipients={emailRecipients}
                        stageOfInvestmentOptions={stagesOfInvestmentOptions || []}
                        roundStructureOptions={roundStructureOptions || []}
                        industryOptions={industryOptions || []}
                    />
                </>
            }
        </div>
    );
};

export default Body;
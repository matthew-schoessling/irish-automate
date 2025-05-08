import { useState, useEffect } from 'react';
import OpportunityInfo from '../OpportunityInfo/OpportunityInfo';
import SelectorExportContainer from '../SelectorExportContainer/SelectorExportContainer';
import CoinvestorList from '../CoinvestorList/CoinvestorList';
import { Opportunity, Stage, CustomField, Person } from '../../../helpers/types';
import { baseUrl, headers } from '../../../helpers/constants';
import './Body.css'; 

function Body(){
    const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity>();
    const [stage, setStage] = useState<Stage>();
    const [industry, setIndustry] = useState<string>('');
    const [customFieldsDict, setCustomFieldsDict] = useState<Record<number, CustomField>>();
    const [contact, setContact] = useState<Person>();

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

        if (customFieldsDict === undefined)
            fetchData()
    });

    const coinvestorRatingsOptions = customFieldsDict ? customFieldsDict[648777].options : [];

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
            />
            <OpportunityInfo
                selectedOpportunity={selectedOpportunity}
                stage={stage}
                industry={industry}
            />
            <CoinvestorList coinvestorRatingsOptions={coinvestorRatingsOptions || []} />
        </div>
    );
};

export default Body;
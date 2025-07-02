import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { baseUrl, headers} from '../../../helpers/constants';
import { SelectOption, Opportunity, Person, EntityCustomField, CustomField, Stage, Option } from '../../../helpers/types';
import { findContactEmail, getIndustries } from '../../../helpers/methods';

interface OpportunitySelectorProps {
    setSelectedOpportunity: React.Dispatch<React.SetStateAction<Opportunity | undefined>>;
    setStage: React.Dispatch<React.SetStateAction<Stage | undefined>>;
    setIndustry: React.Dispatch<React.SetStateAction<string>>;
    setContact: React.Dispatch<React.SetStateAction<Person | undefined>>;
    industryOptions: Option[];
}

function OpportunitySelector({
    setSelectedOpportunity,
    setStage, 
    setIndustry,
    setContact,
    industryOptions
}: OpportunitySelectorProps){
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [selectOpps, setSelectOpps] = useState<SelectOption[]>([]);
    const [stages, setStages] = useState<Stage[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const listOpportunitiesUrl = baseUrl + 'opportunities/search';
            const apiStageUrl = `${baseUrl}/pipeline_stages`;
            let allCompanies: Opportunity[] = [];
            // No efficient way to get total opportunities in Copper, so use a total pages that is much greater than actual amount total pages
            const totalPages = 50;
        
            try {
                const requests = Array.from({ length: totalPages}, (_, i) =>
                    fetch(listOpportunitiesUrl, {
                        method: "POST",
                        headers: headers,
                        body: JSON.stringify({ page_size: 200, page_number: i + 1 }),
                    }).then((res) => res.json())
                );

                const stageResponse = await fetch(apiStageUrl, {
                    method: 'GET',
                    headers: headers
                });
            
                const results = await Promise.all(requests);
                
                const companies: Opportunity[] = results.flatMap((result) => 
                    result.map((opp: Opportunity) => ({ id: opp.id, company_name: opp.company_name, name: opp.name })) // returning Opportunity objects
                ).filter(opp => opp.company_name != null);
                const stageData = await stageResponse.json();
                setOpportunities(companies);
                setSelectOpps(companies.map(opp => ({value: opp.id, label: opp.name})))
                setStages(stageData);
            } catch (error) {
                console.log('Error: ', error);
            }
        }

        if (opportunities.length == 0)
            fetchData()
    });

    const onOpportunitySelect = async (selectedOption: SelectOption) => {

        if (selectedOption == null) return;

        // API credentials
        const apiOppUrl = `${baseUrl}/opportunities/${selectedOption.value}`;

        try {
        // Make the GET request
        const response = await fetch(apiOppUrl, {
            method: 'GET',
            headers: headers
        });

        // Check if the response was successful
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Parse JSON response
        const data = await response.json() as Opportunity;

        // Get Primary Contact Info
        const apiContactUrl = `${baseUrl}/people/${data.primary_contact_id}`;
        const contactResponse = await fetch(apiContactUrl, {
            method: 'GET',
            headers: headers
        });
        const contactData = await contactResponse.json() as Person;

        setSelectedOpportunity(data);
        setStage(stages?.find(stage => stage.id == data.pipeline_stage_id));
        const oppsIndustryIds = getIndustries(data.custom_fields, industryOptions);
        setIndustry(oppsIndustryIds);

        // Find contact's work email or first email in their list
        contactData.email = findContactEmail(contactData.emails);
        setContact(contactData);
        
        } catch (error) {
        console.error('Error fetching data:', error);
        }
    };

    return (
        <div className="content">
            <Select 
            options={selectOpps} 
            placeholder="Select an Opportunity..."
            menuPortalTarget={document.body} 
            onChange={(selectedOption) => {
                if (selectedOption) {
                    onOpportunitySelect(selectedOption);
                }
            }}
            styles={{ 
                menuPortal: base => ({ ...base, zIndex: 9999 }), 
                control: base => ({ ...base, width: '70vw', margin: '20px 1vw 0 0', borderColor: '#0C2340', '&:hover': {borderColor: '#0C2340'}, color: '#0C2340' }),
                option: base => ({ ...base, color: '#0C2340', borderColor: '#0C2340'}),
                placeholder: base => ({ ...base, color: '#0C2340'}),
                indicatorSeparator: base => ({ ...base, backgroundColor: '#0C2340'}),
                dropdownIndicator: base => ({ ...base, color: '#0C2340', '&:hover': {color: '#0C2340'}})
            }} 
            />
        </div>
    );
}

export default OpportunitySelector;
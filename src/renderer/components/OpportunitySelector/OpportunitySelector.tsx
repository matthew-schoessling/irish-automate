import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { baseUrl, headers} from '../../../helpers/constants';
import { SelectOption, Opportunity, Person, Website, Stage, Option, Company } from '../../../helpers/types';
import { findContactEmail, getIndustries, fetchContactData, fetchCompanyData } from '../../../helpers/methods';

interface OpportunitySelectorProps {
    setSelectedOpportunity: React.Dispatch<React.SetStateAction<Opportunity | undefined>>;
    setStage: React.Dispatch<React.SetStateAction<Stage | undefined>>;
    setIndustry: React.Dispatch<React.SetStateAction<string>>;
    setContact: React.Dispatch<React.SetStateAction<Person | undefined>>;
    industryOptions: Option[];
    opportunities: Opportunity[];
    stages: Stage[];
}

function OpportunitySelector({
    setSelectedOpportunity,
    setStage, 
    setIndustry,
    setContact,
    industryOptions,
    opportunities,
    stages
}: OpportunitySelectorProps){
    const [selectOpps, setSelectOpps] = useState<SelectOption[]>([]);

    useEffect(() => {
        setSelectOpps(opportunities.map(opp => ({value: opp.id, label: opp.name})))
    }, [opportunities]);

    const onOpportunitySelect = async (selectedOption: SelectOption) => {

        if (selectedOption == null) return;

        const selectedOpportunity = opportunities.find(opp => opp.id === selectedOption.value);
        if (!selectedOpportunity) return;

        // Get Primary Contact Info
        await fetchContactData(selectedOpportunity.primary_contact_id, setContact);

        // Get Company Info - In copper, an opportunity and company are two different entities and hold different information
        // The company entity holds important info such as the company website url
        const companyData = await fetchCompanyData(selectedOpportunity.company_id);

        // Now that we have all the info we need, set the Selected Opportunity
        selectedOpportunity.opportunity_website = companyData.websites.find((website: Website) => website.category === "work")?.url;
        setSelectedOpportunity(selectedOpportunity);

        // Set the stage (pre-seed, seed, a, etc) of the opportunity
        setStage(stages?.find(stage => stage.id == selectedOpportunity.pipeline_stage_id));

        // Set the industries the opportunity is in (Agriculture, LegalTech, AI, etc)
        const oppsIndustryIds = getIndustries(selectedOpportunity.custom_fields, industryOptions, ', ');
        setIndustry(oppsIndustryIds);
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
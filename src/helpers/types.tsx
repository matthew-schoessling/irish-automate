export interface SelectOption {
    value: number;  
    label: string;
}

export interface EntityCustomField {
    custom_field_definition_id: number;
    value: any;
}

export interface Option {
    id: number;
    name: string;
    rank: number;
}

export interface CustomField {
    id: number;
    name: string;
    data_type: string;
    available_on: string[];
    is_filterable: boolean;
    currency: string[] | undefined;
    options: Option[] | undefined;
}

export interface Opportunity {
    id: number;
    name: string;
    company_name: string;
    details: string;
    pipeline_stage_id: number;
    primary_contact_id: number;
    custom_fields: EntityCustomField[];
}

export interface Stage {
    id: number;
    name: string;
}

export interface Person {
    id: number;
    company_id: number;
    name: string;
    email: string;
    interaction_count: number,
    date_last_contacted: number,
    emails: Email[];
}

export interface Email {
    email: string;
    category: string;
}

export interface Coinvestor {
    id: number;
    name: string;
    custom_fields: EntityCustomField[];
    opportunityMatchRank: number;
    assignee_id: number;
    matchingCriteria: string[];
    nonmatchingCriteria: string[];
    details: string;
    contacts: Person[];
}

export interface User {
    id: number,
    name: string,
    email: string
}
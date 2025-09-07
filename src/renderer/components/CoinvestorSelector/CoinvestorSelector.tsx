import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { SelectOption, Option, Coinvestor } from '../../../helpers/types';

interface CoinvestorSelectorProps {
    setSelectedCoinvestor: React.Dispatch<React.SetStateAction<Coinvestor | undefined>>;
    coinvestors: Coinvestor[];
}

function CoinvestorSelector({
    setSelectedCoinvestor,
    coinvestors
}: CoinvestorSelectorProps){
    const [selectCoinvestors, setSelectCoinvestors] = useState<SelectOption[]>([]);

    useEffect(() => {
        setSelectCoinvestors(coinvestors.map(coinvestor => ({value: coinvestor.id, label: coinvestor.name})))
    }, [coinvestors]);

    const onCoinvestorSelect = async (coinvestorSelected: SelectOption) => {

        if (coinvestorSelected == null) return;

        const selectedCoinvestor = coinvestors.find(coinvestor => coinvestor.id === coinvestorSelected.value);
        if (!selectedCoinvestor) return;

        setSelectedCoinvestor(selectedCoinvestor);
    };

    return (
        <div className="content">
            <Select 
            options={selectCoinvestors} 
            placeholder="Select a Coinvestor..."
            menuPortalTarget={document.body} 
            onChange={(selectedOption) => {
                if (selectedOption) {
                    onCoinvestorSelect(selectedOption);
                }
            }}
            styles={{ 
                menuPortal: base => ({ ...base, zIndex: 9999 }), 
                control: base => ({ ...base, width: '90vw', margin: '20px 0 0 0', borderColor: '#0C2340', '&:hover': {borderColor: '#0C2340'}, color: '#0C2340' }),
                option: base => ({ ...base, color: '#0C2340', borderColor: '#0C2340'}),
                placeholder: base => ({ ...base, color: '#0C2340'}),
                indicatorSeparator: base => ({ ...base, backgroundColor: '#0C2340'}),
                dropdownIndicator: base => ({ ...base, color: '#0C2340', '&:hover': {color: '#0C2340'}})
            }} 
            />
        </div>
    );
}

export default CoinvestorSelector;
import React, { useState } from 'react';

const CrudPanel = ({ title, items, onItemsUpdate, placeholder }) => {
    const [inputText, setInputText] = useState('');

    const handleAddFromText = () => {
        if (!inputText.trim()) return;

        const newItems = inputText
            .split(',')
            .map(item => item.trim())
            .filter(item => item.length > 0);

        const updatedItems = [...items, ...newItems];
        onItemsUpdate(updatedItems);
        setInputText('');
    };

    const handleRemoveItem = (indexToRemove) => {
        const updatedItems = items.filter((_, index) => index !== indexToRemove);
        onItemsUpdate(updatedItems);
    };

    const handleClearAll = () => {
        onItemsUpdate([]);
    };

    return (
        <div className="crud-panel">
            <h3>{title}</h3>

            <div className="input-section">
                <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={placeholder}
                    rows="3"
                    style={{ width: '100%', marginBottom: '10px' }}
                />
                <button onClick={handleAddFromText}>Agregar {title}</button>
                <button onClick={handleClearAll} style={{ marginLeft: '10px', backgroundColor: '#ff4444' }}>
                    Limpiar Todo
                </button>
            </div>

            <div className="items-list">
                <h4>Lista actual ({items.length}):</h4>
                <ul>
                    {items.map((item, index) => (
                        <li key={index}>
                            {item}
                            <button
                                onClick={() => handleRemoveItem(index)}
                                style={{ marginLeft: '10px', fontSize: '12px' }}
                            >
                                Eliminar
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default CrudPanel;
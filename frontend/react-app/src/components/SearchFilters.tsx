import React, { useState } from 'react';

interface SearchFiltersProps {
  onSearch: (filters: { last_name: string; date_of_birth: string; phone_number: string }) => void;
  onClear: () => void;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({ onSearch, onClear }) => {
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      last_name: lastName.trim(),
      date_of_birth: dob,
      phone_number: phoneNumber.trim(),
    });
  };

  const handleClear = () => {
    setLastName('');
    setDob('');
    setPhoneNumber('');
    onClear();
  };

  return (
    <div className="filters-container">
      <form onSubmit={handleSubmit} className="filters-grid">
        <div className="form-group">
          <label htmlFor="search-lastname">Last Name</label>
          <input
            id="search-lastname"
            type="text"
            className="form-control"
            placeholder="Search by last name..."
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="search-dob">Date of Birth</label>
          <input
            id="search-dob"
            type="date"
            className="form-control"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="search-phone">Phone Number</label>
          <input
            id="search-phone"
            type="text"
            className="form-control"
            placeholder="10-digit phone number..."
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </div>
        <div className="filter-actions">
          <button type="button" className="btn btn-secondary" onClick={handleClear}>
            Clear
          </button>
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </div>
      </form>
    </div>
  );
};

function initAutocomplete() {
const addressFields = [
    'current-address',
    'previous-resident-address',
    'previous-resident-address-two',
    'previous-resident-address-three',
    'previous-resident-address-fourth'
];

addressFields.forEach(fieldName => {
    const input = document.querySelector(`[name="${fieldName}"]`);
    if (input) {
    const autocomplete = new google.maps.places.Autocomplete(input, {
        types: ['address'],
        componentRestrictions: { country: 'au' } // Optional: restrict to Australia
    });
    autocomplete.setFields(['address_components', 'formatted_address']);
    }
});
}
  
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const EmployerRegisterPage = () => {
  const navigate = useNavigate();
  const [businesscountry, setBusinessCountry] = useState('Nepal');
  const [countryCode, setCountryCode] = useState('+977');
  const [businessNumber, setBusinessNumber] = useState('');

  const handleRegister = () => {
    localStorage.setItem('isAuthenticated', 'true');
    navigate('/home');
  };

  const handleBusinessCountryChange = (e) => {
    setBusinessCountry(e.target.value);
  };

  const handleCountryCodeChange = (e) => {
    setCountryCode(e.target.value);
    setBusinessNumber('');
  };

  return (
    <div className="min-h-screen flex justify-center p-12">
      <div className="w-full max-w-2xl">
        <div className="p-0 mb-4">
            {/* Heading */}
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Your employer account</h2>
            <p className="text-sm font-regular text-gray-700 mb-4">You're almost done! We need some details about your business to verify your account. 
                We won't share your details with anyone.</p>
        </div>
        <div className="mb-4">
            <h4 className='text-md font-medium text-gray-800'>Email</h4>
            <p className='text-sm font-regular text-gray-700'>nirvantmg2@gmail.com</p>
        </div>
        {/* Form */}
        <form onSubmit={(e) => { e.preventDefault(); handleRegister(); }} className="space-y-5">
          {/* Full Name */}
          <div className="flex gap-2">
            <div className="form-control flex-1">
                <label className="block text-md font-medium text-gray-800 mb-2" htmlFor="firstname">First Name</label>
                <input
                id="firstname"
                type="text"
                placeholder=""
                className="w-full border border-gray-300 rounded-lg h-10 text-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                />
            </div>
            <div className="form-control flex-1">
                <label className="block text-md font-medium text-gray-800 mb-2" htmlFor="middlename">Middle Name (Optional)</label>
                <input
                id="middlename"
                type="text"
                placeholder=""
                className="w-full border border-gray-300 rounded-lg h-10 text-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                
                />
            </div>
            <div className="form-control flex-1">
                <label className="block text-md font-medium text-gray-800 mb-2" htmlFor="lastname">Last Name</label>
                <input
                id="lastname"
                type="text"
                placeholder=""
                className="w-full border border-gray-300 rounded-lg h-10 text-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                />
            </div>
          </div>
          <div className="d">
            <div className="form-control flex-1 mb-4">
                <label className="block text-md font-medium text-gray-800" htmlFor="businessname">Business Name</label>
                <p className='text-sm font-regular text-gray-500 mb-2'>We need your registered business name to verify your account.</p>
                <input
                id="businessname"
                type="text"
                placeholder=""
                className="w-full border border-gray-300 rounded-lg h-10 text-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                />
            </div>
            {businesscountry === 'Nepal' && (
            <div className="form-control flex-1 mb-4">
                <label className="block text-md font-medium text-gray-800 mb-2" htmlFor="vatnumber">VAT number</label>
                <input
                id="vatnumber"
                type="text"
                placeholder=""
                className="w-full border border-gray-300 rounded-lg h-10 text-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                />
            </div>
            )}
            <div className="form-control flex-1 mb-4">
                <label className="block text-md font-medium text-gray-800 mb-2" htmlFor="businesscountry">Country</label>
                <select
                    id="businesscountry"
                    value={businesscountry}
                    onChange={handleBusinessCountryChange}
                    className="w-full border border-gray-300 rounded-lg h-10 text-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                >
                    <option value="Nepal">Nepal</option>
                    <option value="Australia">Australia</option>
                    <option value="New Zealand">New Zealand</option>
                    <option value="United States">United States</option>
                    <option value="India">India</option>
                    <option value="Canada">Canada</option>
                </select>
            </div>
            <div className="form-control flex-1">
                <h4 className="block text-md font-medium text-gray-800 mb-2">Phone number</h4>
                <div className="flex gap-2">
                <select
                    id="countrycode"
                    value={countryCode}
                    onChange={handleCountryCodeChange}
                    className="w-1/2 border border-gray-300 rounded-lg h-10 text-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                >
                    <option value="+977">Nepal (+977)</option>
                    <option value="+61">Australia (+61)</option>
                    <option value="+64">New Zealand (+64)</option>
                    <option value="+1">USA (+1)</option>
                    <option value="+91">India (+91)</option>
                    <option value="+44">UK (+44)</option>
                </select>

                <input
                    type="text"
                    id="businessnumber"
                    value={`${countryCode} | ${businessNumber}`}
                    onChange={(e) => {
                    const input = e.target.value.split('|')[1]?.trim() || '';
                    setBusinessNumber(input);
                    }}
                    placeholder=""
                    className="w-1/2 border border-gray-300 rounded-lg h-10 text-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />
                </div>
            </div>
          </div>
          <div className="block mt-12">
            {/* Register Button */}
            <button
                type="submit"
                className="bg-[#003893] hover:bg-blue-500 text-white rounded-lg px-6 py-2 font-medium transition-all text-md"
            >
                Register your business
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployerRegisterPage;

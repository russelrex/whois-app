import React, { useState } from 'react';
import axios from 'axios';
import '../app/globals.css';
import { EyeIcon, EyeOffIcon } from '@heroicons/react/outline';
import toast, { Toaster } from 'react-hot-toast';

interface RegistryData {
  domainName: string;
  registrarName: string;
  createdDate: string;
  expiresDate: string;
  estimatedDomainAge: Date;
  nameServers: NameServers;
}

interface NameServers {
  hostNames: string[]
}

interface AdministrativeContact {
  name: string;
}

interface Registrant {
  name: string;
}

interface TechnicalContact {
  name: string;
}

interface WhoisRecord {
  administrativeContact: AdministrativeContact;
  registryData: RegistryData;
  registrant: Registrant;
  technicalContact: TechnicalContact;
  contactEmail: string;
}

const truncateString = (str: string, num: number): string => {
  if (str.length > num) {
    return str.slice(0, num) + '...';
  }
  return str;
};

const calculateDaysBetweenDates = (startDate: string, endDate: string): string => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return `${diffDays} Days`;
};

const App = () => {
  const [domainName, setDomain] = useState('');
  const [record, setRecord] = useState<WhoisRecord | null>(null);
  const [error, setError] = useState('');  
  const [isContactInformationHidden, setContactInformationHidden] = useState<boolean>(false);
  const [isDomainInformationHidden, setDomainInformationHidden] = useState<boolean>(false);

  const toggleContactInformation = () => {
    setContactInformationHidden(!isContactInformationHidden);
  };

  const toggleDomainInformation = () => {
    setDomainInformationHidden(!isDomainInformationHidden);
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    setError('');
    try {
      const response = await axios.get<{ WhoisRecord: WhoisRecord }>(`http://localhost:5001/api/whois`, {
        params: { domainName }
      });

      if (!response.data || !response.data.WhoisRecord) {
        throw new Error('Invalid response data');
      }

      toast.success('Successfully fetched WHOIS data');
      setRecord(response.data.WhoisRecord);
    } catch (err) {
      toast.error('Failed to fetch WHOIS data');
    }
  };

  return (
    <div className="text-center w-custom-1000">
      <div>
        <h1>WHOIS Lookup</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={domainName}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="Enter domain name"
            required
          />
          <button type="submit" className="ml-2">Lookup</button>
        </form>
      </div>
      {record && (
        <>
          <div className='mt-6'>
            <div className="flex justify-center items-center my-2">
              <h1>Domain Information</h1>
              {isDomainInformationHidden ? (
                <EyeOffIcon
                  className="w-6 h-6 ml-2 cursor-pointer hover:text-gray-600 "
                  onClick={toggleDomainInformation} />
              ) : (
                <EyeIcon
                  className="w-6 h-6 ml-2 cursor-pointer hover:text-gray-600"
                  onClick={toggleDomainInformation} />
              )}
            </div>
            {!isDomainInformationHidden ? (
              <table className="table-auto">
                <thead>
                  <tr>
                    <th>Domain Name</th>
                    <th>Registrar</th>
                    <th>Registration Date</th>
                    <th>Expiration Date</th>
                    <th>Estimated Domain Age</th>
                    <th>Hostnames</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{record.registryData.domainName}</td>
                    <td>{record.registryData.registrarName}</td>
                    <td>{new Date(record.registryData.createdDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                    <td>{new Date(record.registryData.expiresDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                    <td>{calculateDaysBetweenDates(record.registryData.createdDate, record.registryData.expiresDate)}</td>
                    <td>
                      {
                        truncateString(record?.registryData?.nameServers?.hostNames && []
                          .map((host) => host)
                          .join(', '), 25)
                      }
                    </td>
                  </tr>
                </tbody>
              </table>
              ) : <p>Domain Information Table Hidden</p>}
          </div><div className='mt-6'>
              <div className="flex justify-center items-center my-2">
                <h1>Contact Information</h1>
                {isContactInformationHidden ? (
                  <EyeOffIcon
                    className="w-6 h-6 ml-2 cursor-pointer hover:text-gray-600 "
                    onClick={toggleContactInformation} />
                ) : (
                  <EyeIcon
                    className="w-6 h-6 ml-2 cursor-pointer hover:text-gray-600"
                    onClick={toggleContactInformation} />
                )}
              </div>
              {!isContactInformationHidden ? (
                <table className="table-auto">
                <thead>
                  <tr>
                    <th>Registrant Name</th>
                    <th>Technical Contact Name</th>
                    <th>Administrative Contact Name</th>
                    <th>Contact Email</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{record.registrant.name}</td>
                    <td>{record.technicalContact.name}</td>
                    <td>{record.administrativeContact.name}</td>
                    <td>{record.contactEmail}</td>
                  </tr>
                </tbody>
              </table>
              ) : <p>Contact Information Table Hidden</p>}
            </div>
          </>
      )}
    <Toaster />
    </div>
  );
};

export default App;
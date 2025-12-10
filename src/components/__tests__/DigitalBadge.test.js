import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DigitalBadge from '../DigitalBadge';

// Mock the dependencies
jest.mock('qrcode.react', () => ({
  QRCodeCanvas: function MockQRCodeCanvas({ value }) {
    return <div data-testid="qr-code">{value}</div>;
  }
}));

jest.mock('html2canvas', () => ({
  __esModule: true,
  default: jest.fn(() => Promise.resolve({
    toDataURL: jest.fn(() => 'data:image/png;base64,mock-image-data')
  }))
}));

jest.mock('jspdf', () => {
  return jest.fn().mockImplementation(() => ({
    addImage: jest.fn(),
    save: jest.fn(),
    addPage: jest.fn()
  }));
});

jest.mock('../config/aptosConfig', () => ({
  getTransactionExplorerUrl: jest.fn((hash) => `https://explorer.aptoslabs.com/txn/${hash}`)
}));

describe('DigitalBadge Component', () => {
  const mockProps = {
    companyName: 'Test Company',
    projectName: 'Mangrove Restoration - Sundarbans',
    creditsRetired: 100,
    retirementDate: '2024-01-15T10:30:00Z',
    transactionHash: '0x1234567890abcdef',
    onClose: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders badge with correct information', () => {
    render(<DigitalBadge {...mockProps} />);
    
    expect(screen.getByText('Test Company')).toBeInTheDocument();
    expect(screen.getByText('Mangrove Restoration - Sundarbans')).toBeInTheDocument();
    expect(screen.getByText('100 Carbon Credits')).toBeInTheDocument();
    expect(screen.getByText('0x1234567890abcdef')).toBeInTheDocument();
  });

  test('renders QR code with correct transaction URL', () => {
    render(<DigitalBadge {...mockProps} />);
    
    const qrCode = screen.getByTestId('qr-code');
    expect(qrCode).toBeInTheDocument();
    expect(qrCode).toHaveTextContent('https://explorer.aptoslabs.com/txn/0x1234567890abcdef');
  });

  test('calls onClose when close button is clicked', () => {
    render(<DigitalBadge {...mockProps} />);
    
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    
    expect(mockProps.onClose).toHaveBeenCalledTimes(1);
  });

  test('renders download buttons', () => {
    render(<DigitalBadge {...mockProps} />);
    
    expect(screen.getByText('Download PNG')).toBeInTheDocument();
    expect(screen.getByText('Download PDF')).toBeInTheDocument();
    expect(screen.getByText('View on Explorer')).toBeInTheDocument();
  });

  test('formats date correctly', () => {
    render(<DigitalBadge {...mockProps} />);
    
    // The date should be formatted in a readable format
    expect(screen.getByText(/January 15, 2024/)).toBeInTheDocument();
  });

  test('displays certificate title', () => {
    render(<DigitalBadge {...mockProps} />);
    
    expect(screen.getByText('CERTIFICATE OF CARBON CREDIT RETIREMENT')).toBeInTheDocument();
    expect(screen.getByText('Climate Action Verified')).toBeInTheDocument();
  });
});

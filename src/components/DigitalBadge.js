import React, { useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { getTransactionExplorerUrl } from '../config/aptosConfig';

const DigitalBadge = ({ 
  companyName, 
  projectName, 
  creditsRetired, 
  retirementDate, 
  transactionHash,
  onClose 
}) => {
  const badgeRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate QR code data with transaction URL
  const qrCodeData = getTransactionExplorerUrl(transactionHash);

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Download as PNG
  const downloadAsPNG = async () => {
    if (!badgeRef.current) return;
    
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(badgeRef.current, {
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      const link = document.createElement('a');
      link.download = `carbon-badge-${transactionHash.slice(0, 8)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error generating PNG:', error);
      alert('Error generating PNG. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Download as PDF
  const downloadAsPDF = async () => {
    if (!badgeRef.current) return;
    
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(badgeRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 297; // A4 width in mm
      const pageHeight = 210; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`carbon-badge-${transactionHash.slice(0, 8)}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-award me-2"></i>
              Digital Carbon Credit Badge
            </h5>
            <button 
              type="button" 
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            {/* Badge Preview */}
            <div className="text-center mb-4">
              <div 
                ref={badgeRef}
                className="badge-container"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '20px',
                  padding: '40px',
                  color: 'white',
                  fontFamily: 'Arial, sans-serif',
                  maxWidth: '800px',
                  margin: '0 auto',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Decorative elements */}
                <div 
                  style={{
                    position: 'absolute',
                    top: '-50px',
                    right: '-50px',
                    width: '200px',
                    height: '200px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '50%',
                    zIndex: 1
                  }}
                ></div>
                <div 
                  style={{
                    position: 'absolute',
                    bottom: '-30px',
                    left: '-30px',
                    width: '150px',
                    height: '150px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '50%',
                    zIndex: 1
                  }}
                ></div>

                {/* Badge Content */}
                <div style={{ position: 'relative', zIndex: 2 }}>
                  {/* Header */}
                  <div className="mb-4">
                    <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '10px' }}>
                      CERTIFICATE OF CARBON CREDIT RETIREMENT
                    </div>
                    <div style={{ 
                      fontSize: '48px', 
                      fontWeight: 'bold', 
                      marginBottom: '20px',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                    }}>
                      🌱
                    </div>
                    <div style={{ 
                      fontSize: '32px', 
                      fontWeight: 'bold',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                    }}>
                      Climate Action Verified
                    </div>
                  </div>

                  {/* Main Content */}
                  <div className="row mb-4">
                    <div className="col-md-8">
                      <div style={{ fontSize: '18px', marginBottom: '20px' }}>
                        <div style={{ marginBottom: '15px' }}>
                          <strong>Organization:</strong> {companyName}
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                          <strong>Project:</strong> {projectName}
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                          <strong>Credits Retired:</strong> {creditsRetired.toLocaleString()} Carbon Credits
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                          <strong>Retirement Date:</strong> {formatDate(retirementDate)}
                        </div>
                        <div style={{ 
                          fontSize: '14px', 
                          opacity: 0.8,
                          wordBreak: 'break-all',
                          marginTop: '20px'
                        }}>
                          <strong>Transaction Hash:</strong><br />
                          <code style={{ 
                            background: 'rgba(255,255,255,0.2)', 
                            padding: '5px 10px', 
                            borderRadius: '5px',
                            fontSize: '12px'
                          }}>
                            {transactionHash}
                          </code>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4 text-center">
                      <div style={{ 
                        background: 'rgba(255,255,255,0.2)', 
                        padding: '20px', 
                        borderRadius: '15px',
                        marginBottom: '20px'
                      }}>
                        <div style={{ fontSize: '14px', marginBottom: '10px', opacity: 0.9 }}>
                          Verify on Blockchain
                        </div>
                        <QRCodeCanvas 
                          value={qrCodeData}
                          size={120}
                          level="M"
                          includeMargin={true}
                          style={{ background: 'white', padding: '10px', borderRadius: '10px' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div style={{ 
                    borderTop: '2px solid rgba(255,255,255,0.3)', 
                    paddingTop: '20px',
                    fontSize: '14px',
                    opacity: 0.9
                  }}>
                    <div style={{ marginBottom: '10px' }}>
                      This certificate verifies the permanent retirement of carbon credits on the Aptos blockchain.
                    </div>
                    <div style={{ fontSize: '12px', opacity: 0.7 }}>
                      Generated by Blue Carbon Registry • {new Date().toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Download Buttons */}
            <div className="text-center">
              <div className="btn-group" role="group">
                <button 
                  className="btn btn-success btn-lg"
                  onClick={downloadAsPNG}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Generating...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-download me-2"></i>
                      Download PNG
                    </>
                  )}
                </button>
                <button 
                  className="btn btn-primary btn-lg"
                  onClick={downloadAsPDF}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Generating...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-file-earmark-pdf me-2"></i>
                      Download PDF
                    </>
                  )}
                </button>
                <button 
                  className="btn btn-outline-secondary btn-lg"
                  onClick={() => window.open(qrCodeData, '_blank')}
                >
                  <i className="bi bi-box-arrow-up-right me-2"></i>
                  View on Explorer
                </button>
              </div>
            </div>

            {/* Instructions */}
            <div className="alert alert-info mt-4">
              <h6><i className="bi bi-info-circle me-2"></i>About This Badge</h6>
              <ul className="mb-0">
                <li>This digital badge serves as verifiable proof of your climate action</li>
                <li>The QR code links directly to the blockchain transaction for verification</li>
                <li>You can share this badge on social media or include it in sustainability reports</li>
                <li>The badge is cryptographically linked to the blockchain for tamper-proof verification</li>
              </ul>
            </div>
          </div>
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DigitalBadge;

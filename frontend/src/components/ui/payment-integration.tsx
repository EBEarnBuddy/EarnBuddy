import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  DollarSign,
  Shield,
  Check,
  X,
  Lock,
  AlertCircle,
  Calendar,
  User,
  Building
} from 'lucide-react';

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'paypal';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

interface PaymentIntegrationProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  description: string;
  recipientName: string;
  onPaymentComplete: (paymentId: string) => void;
}

export const PaymentIntegration: React.FC<PaymentIntegrationProps> = ({
  isOpen,
  onClose,
  amount,
  description,
  recipientName,
  onPaymentComplete
}) => {
  const [step, setStep] = useState<'method' | 'details' | 'confirm' | 'processing' | 'success'>('method');
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: '',
    zip: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  // TODO: Implement real payment methods fetching
  const paymentMethods: PaymentMethod[] = [];

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    setStep('processing');

    // Simulate payment processing
    setTimeout(() => {
      setStep('success');
      setIsProcessing(false);
      setTimeout(() => {
        onPaymentComplete('payment_' + Date.now());
        onClose();
      }, 2000);
    }, 3000);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-md w-full"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-emerald-600" />
                Payment
              </h2>
              {step !== 'processing' && step !== 'success' && (
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Payment Summary */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 dark:text-gray-400">Amount</span>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatAmount(amount)}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 dark:text-gray-400">To</span>
                <span className="font-medium text-gray-900 dark:text-white">{recipientName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">For</span>
                <span className="text-gray-900 dark:text-white">{description}</span>
              </div>
            </div>

            {/* Step Content */}
            <AnimatePresence mode="wait">
              {step === 'method' && (
                <motion.div
                  key="method"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Choose Payment Method
                  </h3>

                  <div className="space-y-3 mb-6">
                    {paymentMethods.map(method => (
                      <button
                        key={method.id}
                        onClick={() => setSelectedMethod(method.id)}
                        className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                          selectedMethod === method.id
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <CreditCard className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {method.brand} •••• {method.last4}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Expires {method.expiryMonth}/{method.expiryYear}
                              </p>
                            </div>
                          </div>
                          {method.isDefault && (
                            <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                      </button>
                    ))}

                    <button
                      onClick={() => {
                        setSelectedMethod('new');
                        setStep('details');
                      }}
                      className="w-full p-4 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-emerald-400 transition-colors text-center"
                    >
                      <Plus className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                      <span className="text-gray-600 dark:text-gray-400">Add New Payment Method</span>
                    </button>
                  </div>

                  <button
                    onClick={() => setStep('confirm')}
                    disabled={!selectedMethod || selectedMethod === 'new'}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                  </button>
                </motion.div>
              )}

              {step === 'details' && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Card Details
                  </h3>

                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Card Number
                      </label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          value={cardDetails.number}
                          onChange={(e) => setCardDetails(prev => ({
                            ...prev,
                            number: formatCardNumber(e.target.value)
                          }))}
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Expiry Date
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="text"
                            value={cardDetails.expiry}
                            onChange={(e) => setCardDetails(prev => ({
                              ...prev,
                              expiry: formatExpiry(e.target.value)
                            }))}
                            placeholder="MM/YY"
                            maxLength={5}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          CVC
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="text"
                            value={cardDetails.cvc}
                            onChange={(e) => setCardDetails(prev => ({
                              ...prev,
                              cvc: e.target.value.replace(/\D/g, '').slice(0, 4)
                            }))}
                            placeholder="123"
                            maxLength={4}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Cardholder Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          value={cardDetails.name}
                          onChange={(e) => setCardDetails(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="John Doe"
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep('method')}
                      className="flex-1 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setStep('confirm')}
                      disabled={!cardDetails.number || !cardDetails.expiry || !cardDetails.cvc || !cardDetails.name}
                      className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Continue
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 'confirm' && (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Confirm Payment
                  </h3>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                          Secure Payment
                        </p>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                          Your payment information is encrypted and secure. This transaction will be processed immediately.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-6">
                    <Shield className="w-6 h-6 text-green-600" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Protected by 256-bit SSL encryption
                    </span>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep(selectedMethod === 'new' ? 'details' : 'method')}
                      className="flex-1 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handlePayment}
                      className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
                    >
                      Pay {formatAmount(amount)}
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 'processing' && (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Processing Payment
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Please wait while we process your payment securely...
                  </p>
                </motion.div>
              )}

              {step === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Payment Successful!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Your payment of {formatAmount(amount)} has been processed successfully.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};